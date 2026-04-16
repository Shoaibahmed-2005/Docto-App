from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

models.Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="Docto API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth, patients, doctors, bookings, reviews, subscriptions, admin, prescriptions
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(patients.router, prefix="/patients", tags=["patients"])
app.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
