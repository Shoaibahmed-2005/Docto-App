from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import date, time, datetime
from uuid import UUID
from models import SpecializationEnum, SubscriptionPlanEnum, BookingStatusEnum, PaymentStatusEnum

# Reusable Pydantic v2 ORM base config
class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: UUID

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    profile_photo: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(OrmBase, UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    subscription_plan: Optional[SubscriptionPlanEnum] = None
    subscription_expires_at: Optional[datetime] = None

class DoctorBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    specialization: Optional[SpecializationEnum] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_lat: Optional[float] = None
    clinic_lng: Optional[float] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None

class DoctorCreate(DoctorBase):
    password: str

class DoctorOut(OrmBase, DoctorBase):
    id: UUID
    is_verified: bool
    is_active: bool
    subscription_plan: SubscriptionPlanEnum
    subscription_expires_at: Optional[datetime]
    avg_rating: float
    total_reviews: int
    created_at: datetime

class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[SpecializationEnum] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_lat: Optional[float] = None
    clinic_lng: Optional[float] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None

class DoctorSlotBase(BaseModel):
    date: date
    start_time: time
    end_time: time
    is_online: bool = False

class DoctorSlotCreate(DoctorSlotBase):
    pass

class DoctorSlotOut(OrmBase, DoctorSlotBase):
    id: UUID
    doctor_id: UUID
    is_booked: bool
    created_at: datetime

class BookingBase(BaseModel):
    doctor_id: UUID
    slot_id: UUID

class BookingCreate(BookingBase):
    is_emergency: bool = False

class BookingOut(OrmBase, BookingBase):
    id: UUID
    patient_id: UUID
    status: BookingStatusEnum
    advance_amount: float
    payment_id: Optional[str] = None
    payment_status: PaymentStatusEnum
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    is_emergency: bool = False
    delay_minutes: int = 0
    discount_applied: bool = False
    created_at: datetime

class BookingDetailOut(BookingOut):
    doctor: DoctorOut
    slot: DoctorSlotOut

class ReviewBase(BaseModel):
    rating: int
    review_text: Optional[str] = None

class ReviewCreate(ReviewBase):
    booking_id: UUID

class ReviewOut(OrmBase, ReviewBase):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    booking_id: UUID
    created_at: datetime

class SubscriptionOut(OrmBase):
    id: UUID
    doctor_id: UUID
    plan: SubscriptionPlanEnum
    amount_paid: float
    started_at: datetime
    expires_at: Optional[datetime] = None

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class AdminOut(OrmBase):
    id: UUID
    email: EmailStr
    full_name: str
    created_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RazorpayOrderOut(BaseModel):
    order_id: str
    amount: int
    currency: str
    booking_id: UUID


class PrescriptionCreate(BaseModel):
    booking_id: UUID
    diagnosis: Optional[str] = None
    medicines: Optional[str] = None
    instructions: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None


class PrescriptionOut(OrmBase):
    id: UUID
    booking_id: UUID
    doctor_id: UUID
    patient_id: UUID
    diagnosis: Optional[str] = None
    medicines: Optional[str] = None
    instructions: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    doctor: Optional[DoctorOut] = None

class PatientHistoryItem(BaseModel):
    booking_id: UUID
    date: date
    start_time: time
    diagnosis: Optional[str] = None
    medicines: Optional[str] = None
    instructions: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None

class PatientHistoryOut(BaseModel):
    patient: UserOut
    history: List[PatientHistoryItem]
    is_truncated: bool
    plan_limit_message: Optional[str] = None
