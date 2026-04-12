from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, DoctorSlot, Doctor, User
import schemas
import auth
from uuid import UUID
from datetime import datetime
import os
import razorpay
import hmac, hashlib

router = APIRouter()

@router.post("", response_model=schemas.RazorpayOrderOut)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db), current_patient: User = Depends(auth.get_current_patient)):
    doctor = db.query(Doctor).filter(Doctor.id == booking.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    slot = db.query(DoctorSlot).filter(DoctorSlot.id == booking.slot_id).with_for_update().first()
    if not slot or slot.is_booked:
        db.rollback()
        raise HTTPException(status_code=400, detail="Slot is not available")
    
    advance_pct = float(os.getenv("ADVANCE_PERCENT", "30"))
    fee = float(doctor.consultation_fee) if doctor.consultation_fee else 0
    advance = fee * (advance_pct / 100)
    
    new_booking = Booking(
        patient_id=current_patient.id,
        doctor_id=doctor.id,
        slot_id=slot.id,
        status="pending",
        advance_amount=advance,
        payment_status="pending"
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID", ""), os.getenv("RAZORPAY_KEY_SECRET", "")))
    try:
        order = client.order.create({
            "amount": int(advance * 100),
            "currency": "INR",
            "receipt": f"bk_{new_booking.id}"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return schemas.RazorpayOrderOut(order_id=order["id"], amount=order["amount"], currency=order["currency"], booking_id=new_booking.id)

@router.post("/{id}/confirm-payment")
def confirm_payment(id: UUID, razorpay_payment_id: str, razorpay_signature: str, razorpay_order_id: str, db: Session = Depends(get_db), current_patient: User = Depends(auth.get_current_patient)):
    booking = db.query(Booking).filter(Booking.id == id, Booking.patient_id == current_patient.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    secret = os.getenv("RAZORPAY_KEY_SECRET", "").encode()
    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected = hmac.new(secret, message.encode(), hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(expected, razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    booking.payment_id = razorpay_payment_id
    booking.payment_status = "paid"
    booking.status = "confirmed"
    
    slot = db.query(DoctorSlot).filter(DoctorSlot.id == booking.slot_id).first()
    slot.is_booked = True
    
    db.commit()
    return {"message": "Payment confirmed"}

@router.post("/{id}/cancel")
def cancel_booking(id: UUID, db: Session = Depends(get_db), current_patient: User = Depends(auth.get_current_patient)):
    booking = db.query(Booking).filter(Booking.id == id, Booking.patient_id == current_patient.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    slot = db.query(DoctorSlot).filter(DoctorSlot.id == booking.slot_id).first()
    slot_datetime = datetime.combine(slot.date, slot.start_time)
    hours_until = (slot_datetime - datetime.now()).total_seconds() / 3600
    
    if hours_until <= 6:
        raise HTTPException(status_code=400, detail="Cancellation not allowed within 6 hours of appointment")
        
    client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID", ""), os.getenv("RAZORPAY_KEY_SECRET", "")))
    if booking.payment_id:
        try:
            client.payment.refund(booking.payment_id, {"amount": int(float(booking.advance_amount) * 100)})
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    booking.status = "cancelled"
    booking.payment_status = "refunded"
    booking.cancelled_at = datetime.now()
    slot.is_booked = False
    db.commit()
    return {"message": "Booking cancelled and refunded"}
