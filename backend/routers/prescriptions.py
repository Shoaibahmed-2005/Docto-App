from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Prescription, Booking, Doctor, User, SubscriptionPlanEnum
import schemas
import auth
from uuid import UUID
from datetime import datetime, timezone

router = APIRouter()


@router.post("", response_model=schemas.PrescriptionOut)
def create_prescription(
    data: schemas.PrescriptionCreate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(auth.get_current_doctor)
):
    # Validate booking belongs to this doctor
    booking = db.query(Booking).filter(
        Booking.id == data.booking_id,
        Booking.doctor_id == current_doctor.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or not yours")

    # Only allow prescription for confirmed or completed bookings
    if booking.status not in ["confirmed", "completed"]:
        raise HTTPException(status_code=400, detail="Can only prescribe for confirmed or completed appointments")

    # Upsert — update if exists
    existing = db.query(Prescription).filter(Prescription.booking_id == data.booking_id).first()
    if existing:
        existing.diagnosis = data.diagnosis
        existing.medicines = data.medicines
        existing.instructions = data.instructions
        existing.follow_up_date = data.follow_up_date
        existing.notes = data.notes
        db.commit()
        db.refresh(existing)
        return existing

    prescription = Prescription(
        booking_id=data.booking_id,
        doctor_id=current_doctor.id,
        patient_id=booking.patient_id,
        diagnosis=data.diagnosis,
        medicines=data.medicines,
        instructions=data.instructions,
        follow_up_date=data.follow_up_date,
        notes=data.notes
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription


@router.get("/booking/{booking_id}", response_model=schemas.PrescriptionOut)
def get_prescription_by_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_patient)
):
    """Patient fetches their prescription for a specific booking."""
    prescription = db.query(Prescription).filter(
        Prescription.booking_id == booking_id,
        Prescription.patient_id == current_user.id
    ).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="No prescription found for this appointment")
        
    # Enforce access limits based on patient subscription
    plan = current_user.subscription_plan or SubscriptionPlanEnum.free
    
    # Calculate difference in hours
    # Ensure timezone awareness for subtraction if necessary
    now = datetime.now(timezone.utc)
    rx_time = prescription.created_at
    if rx_time.tzinfo is None:
        rx_time = rx_time.replace(tzinfo=timezone.utc)
        
    age_hours = (now - rx_time).total_seconds() / 3600

    # Limits in hours
    limits = {
        SubscriptionPlanEnum.free: 12,
        SubscriptionPlanEnum.monthly: 7 * 24,
        SubscriptionPlanEnum.quarterly: 30 * 24,
        SubscriptionPlanEnum.annual: 180 * 24,
        SubscriptionPlanEnum.enterprise: float('inf')
    }
    
    limit_hours = limits.get(plan, 12)
    
    if age_hours > limit_hours:
        messages = {
            SubscriptionPlanEnum.free: "Free plan only allows viewing prescriptions for 12 hours.",
            SubscriptionPlanEnum.monthly: "Monthly plan allows viewing prescriptions for 7 days.",
            SubscriptionPlanEnum.quarterly: "Quarterly plan allows viewing prescriptions for 30 days.",
            SubscriptionPlanEnum.annual: "Annual plan allows viewing prescriptions for 6 months."
        }
        msg = messages.get(plan, "Prescription access expired.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail={"message": msg, "code": "UPGRADE_REQUIRED"}
        )
        
    return prescription


@router.get("/doctor/booking/{booking_id}", response_model=schemas.PrescriptionOut)
def get_prescription_as_doctor(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(auth.get_current_doctor)
):
    """Doctor fetches the prescription they wrote for a specific booking."""
    prescription = db.query(Prescription).filter(
        Prescription.booking_id == booking_id,
        Prescription.doctor_id == current_doctor.id
    ).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="No prescription found for this appointment")
    return prescription
