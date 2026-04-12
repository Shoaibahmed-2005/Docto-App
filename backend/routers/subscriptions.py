from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Doctor, Subscription
import schemas
import auth
from datetime import datetime, timedelta
import os
import razorpay
import hmac, hashlib

router = APIRouter()

PLANS = {
    "monthly": {"price": 99, "days": 30},
    "quarterly": {"price": 250, "days": 90},
    "annual": {"price": 999, "days": 365},
    "enterprise": {"price": 349, "days": 30}
}

@router.get("/plans")
def get_plans():
    return {"data": PLANS, "message": "Success"}

@router.post("/create-order")
def create_order(plan_name: str, db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    if plan_name not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    amount = PLANS[plan_name]["price"]
    
    client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID", ""), os.getenv("RAZORPAY_KEY_SECRET", "")))
    order = client.order.create({
        "amount": amount * 100,
        "currency": "INR",
        "receipt": f"sb_{current_doctor.id}"
    })
    return {"order_id": order["id"], "amount": amount, "currency": "INR"}

@router.post("/confirm")
def confirm_subscription(plan_name: str, razorpay_payment_id: str, razorpay_signature: str, razorpay_order_id: str, db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    if plan_name not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
        
    secret = os.getenv("RAZORPAY_KEY_SECRET", "").encode()
    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected = hmac.new(secret, message.encode(), hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(expected, razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

    days = PLANS[plan_name]["days"]
    amount = PLANS[plan_name]["price"]
    
    sub = Subscription(
        doctor_id=current_doctor.id,
        plan=plan_name,
        amount_paid=amount,
        payment_id=razorpay_payment_id,
        expires_at=datetime.utcnow() + timedelta(days=days)
    )
    db.add(sub)
    
    current_doctor.subscription_plan = plan_name
    current_doctor.subscription_expires_at = sub.expires_at
    db.commit()
    
    return {"message": "Subscription updated successfully"}
