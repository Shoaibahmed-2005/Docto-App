from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Review, Booking, Doctor, User
import schemas
import auth
from uuid import UUID

router = APIRouter()

@router.post("", response_model=schemas.ReviewOut)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db), current_patient: User = Depends(auth.get_current_patient)):
    booking = db.query(Booking).filter(Booking.id == review.booking_id, Booking.patient_id == current_patient.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "completed":
        raise HTTPException(status_code=400, detail="Only completed bookings can be reviewed")
        
    existing = db.query(Review).filter(Review.booking_id == review.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")
        
    new_review = Review(
        patient_id=current_patient.id,
        doctor_id=booking.doctor_id,
        booking_id=review.booking_id,
        rating=review.rating,
        review_text=review.review_text
    )
    db.add(new_review)
    
    doctor = db.query(Doctor).filter(Doctor.id == booking.doctor_id).first()
    total_rating = doctor.avg_rating * doctor.total_reviews + review.rating
    doctor.total_reviews += 1
    doctor.avg_rating = total_rating / doctor.total_reviews
    
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/doctors/{doctor_id}", response_model=dict)
def get_doctor_reviews(doctor_id: UUID, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.doctor_id == doctor_id).order_by(Review.created_at.desc()).all()
    out = []
    for r in reviews:
        out.append({
            "id": r.id,
            "patient_name": r.patient.full_name,
            "rating": r.rating,
            "review_text": r.review_text,
            "created_at": r.created_at
        })
    return {"data": out}
