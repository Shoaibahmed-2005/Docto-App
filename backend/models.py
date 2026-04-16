import uuid
import enum
from sqlalchemy import Column, String, Boolean, Text, Integer, Numeric, Float, Date, Time, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP, ENUM as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class SpecializationEnum(str, enum.Enum):
    general_physician = "General Physician"
    pediatrician = "Pediatrician"
    gynecologist = "Gynecologist"
    surgeon = "Surgeon"
    cardiologist = "Cardiologist"
    dermatologist = "Dermatologist"
    orthopedic = "Orthopedic"
    neurologist = "Neurologist"
    psychiatrist = "Psychiatrist"
    ophthalmologist = "Ophthalmologist"
    ent = "ENT"
    dentist = "Dentist"
    veterinary = "Veterinary"
    other = "Other"

class SubscriptionPlanEnum(str, enum.Enum):
    free = "free"
    monthly = "monthly"
    quarterly = "quarterly"
    annual = "annual"
    enterprise = "enterprise"

class BookingStatusEnum(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"
    no_show = "no_show"

class PaymentStatusEnum(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"
    forfeited = "forfeited"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    profile_photo = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), default=func.now())
    is_active = Column(Boolean, default=True)
    subscription_plan = Column(PgEnum(SubscriptionPlanEnum, name="subscription_plan_enum"), default=SubscriptionPlanEnum.free, nullable=True)
    subscription_expires_at = Column(TIMESTAMP(timezone=True), nullable=True)


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    specialization = Column(PgEnum(SpecializationEnum, name="specialization_enum"))
    qualifications = Column(Text)
    experience_years = Column(Integer)
    consultation_fee = Column(Numeric(10, 2))
    clinic_name = Column(String)
    clinic_address = Column(Text)
    clinic_lat = Column(Float)
    clinic_lng = Column(Float)
    profile_photo = Column(String)
    bio = Column(Text)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    subscription_plan = Column(PgEnum(SubscriptionPlanEnum, name="subscription_plan_enum"), default=SubscriptionPlanEnum.free)
    subscription_expires_at = Column(TIMESTAMP(timezone=True), nullable=True)
    avg_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    created_at = Column(TIMESTAMP(timezone=True), default=func.now())


class DoctorSlot(Base):
    __tablename__ = "doctor_slots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_booked = Column(Boolean, default=False)
    is_online = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), default=func.now())

    doctor = relationship("Doctor", backref="slots")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    slot_id = Column(UUID(as_uuid=True), ForeignKey("doctor_slots.id"), nullable=False)
    status = Column(PgEnum(BookingStatusEnum, name="booking_status_enum"), default=BookingStatusEnum.pending)
    advance_amount = Column(Numeric(10, 2))
    payment_id = Column(String, nullable=True)
    payment_status = Column(PgEnum(PaymentStatusEnum, name="payment_status_enum"), default=PaymentStatusEnum.pending)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_at = Column(TIMESTAMP(timezone=True), nullable=True)
    is_emergency = Column(Boolean, default=False)
    delay_minutes = Column(Integer, default=0)
    discount_applied = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), default=func.now())

    patient = relationship("User", backref="bookings")
    doctor = relationship("Doctor", backref="bookings")
    slot = relationship("DoctorSlot", backref="booking", uselist=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), unique=True, nullable=False)
    rating = Column(Integer, CheckConstraint('rating >= 1 AND rating <= 5'), nullable=False)
    review_text = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), default=func.now())

    patient = relationship("User", backref="reviews")
    doctor = relationship("Doctor", backref="reviews")
    booking = relationship("Booking", backref="review", uselist=False)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    plan = Column(PgEnum(SubscriptionPlanEnum, name="subscription_plan_name_enum"), nullable=False)
    amount_paid = Column(Numeric(10, 2))
    started_at = Column(TIMESTAMP(timezone=True), default=func.now())
    expires_at = Column(TIMESTAMP(timezone=True))
    payment_id = Column(String)

    doctor = relationship("Doctor", backref="subscriptions")


class Admin(Base):
    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), default=func.now())


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), unique=True, nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    diagnosis = Column(Text, nullable=True)
    medicines = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), default=func.now())

    booking = relationship("Booking", backref="prescription", uselist=False)
    doctor = relationship("Doctor", backref="prescriptions")
    patient = relationship("User", backref="prescriptions")
