from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Booking
import schemas
import auth
from datetime import datetime

router = APIRouter()

@router.get("/me", response_model=schemas.UserOut)
def get_profile(current_patient: User = Depends(auth.get_current_patient)):
    return current_patient

@router.put("/me", response_model=schemas.UserOut)
def update_profile(update_data: schemas.UserBase, db: Session = Depends(get_db), current_patient: User = Depends(auth.get_current_patient)):
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(current_patient, key, value)
    db.commit()
    db.refresh(current_patient)
    return current_patient

@router.get("/me/bookings")
def get_bookings(db: Session = Depends(get_db), current_patient: User = Depends(auth.get_current_patient)):
    # Auto-cleanup old pending bookings
    from datetime import timedelta
    thirty_mins_ago = datetime.now() - timedelta(minutes=30)
    db.query(Booking).filter(
        Booking.status == "pending",
        Booking.created_at < thirty_mins_ago
    ).delete(synchronize_session=False)
    db.commit()

    bookings = db.query(Booking).filter(
        Booking.patient_id == current_patient.id,
        Booking.status != "pending"
    ).all()
    
    # Lazy status update for past appointments
    now = datetime.now()
    updated = False
    for b in bookings:
        if b.status in ["pending", "confirmed"]:
            # Combine slot date and start time for comparison
            slot_dt = datetime.combine(b.slot.date, b.slot.start_time)
            if slot_dt < now:
                b.status = "no_show"
                if b.payment_status == "paid":
                    b.payment_status = "forfeited"
                updated = True
    
    if updated:
        db.commit()
        # Re-fetch or refresh would be ideal, but modifying objects in place works since we are returning them
        
    out = []
    for b in bookings:
        out.append({"booking": b, "doctor": b.doctor, "slot": b.slot})
    return {"data": out, "message": "Success"}
