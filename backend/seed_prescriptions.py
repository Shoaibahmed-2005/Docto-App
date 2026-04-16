"""
seed_prescriptions.py
Seeds realistic dummy prescriptions for all completed bookings
that don't already have one. Prescriptions are matched to the
doctor's specialisation so they look plausible.
"""
import os, random, uuid
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv(r".env")

from models import Doctor, Booking, Prescription

engine = create_engine(os.getenv("DATABASE_URL"))
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# ─── Realistic prescription data keyed by specialisation ─────────────────────
PRESCRIPTION_DATA = {
    "Dentist": [
        {
            "diagnosis": "Dental caries with mild periapical infection",
            "medicines": "Tab. Amoxicillin 500mg — 1 three times daily for 5 days\nTab. Ibuprofen 400mg — 1 thrice daily after food\nClindamycin gel — apply on affected tooth twice daily",
            "instructions": "Avoid extremely hot or cold food. Use a soft-bristle toothbrush. Rinse with warm salt water twice a day.",
            "notes": "Schedule for filling next visit.",
        },
        {
            "diagnosis": "Gingivitis",
            "medicines": "Chlorhexidine Mouthwash 0.2% — rinse for 60 seconds twice daily\nTab. Metronidazole 400mg — 1 thrice daily for 5 days",
            "instructions": "Floss daily. Avoid tobacco products. Professional cleaning advised.",
            "notes": "Follow-up in 2 weeks for scaling.",
        },
    ],
    "General Physician": [
        {
            "diagnosis": "Acute upper respiratory tract infection",
            "medicines": "Tab. Azithromycin 500mg — 1 daily for 5 days\nSyr. Paracetamol 500mg — 1 thrice daily if fever > 38°C\nTab. Cetirizine 10mg — 1 at bedtime for 5 days\nSaline nasal drops — 2 drops each nostril thrice daily",
            "instructions": "Rest adequately. Drink plenty of warm fluids. Avoid cold drinks and dust exposure.",
            "notes": "Return if fever persists beyond 5 days.",
        },
        {
            "diagnosis": "Acute gastroenteritis",
            "medicines": "ORS Sachet — 1 sachet dissolved in 1L water, sip throughout the day\nTab. Ondansetron 4mg — 1 before meals thrice daily for 3 days\nTab. Metronidazole 400mg — 1 thrice daily for 5 days\nZinc 20mg — 1 daily for 14 days",
            "instructions": "Avoid dairy, spicy, and oily food for 5 days. Light diet (khichdi, curd rice). Hydrate frequently.",
        },
        {
            "diagnosis": "Seasonal viral fever",
            "medicines": "Tab. Paracetamol 650mg — 1 every 6 hours if fever\nTab. Levocetirizine 5mg — 1 at bedtime for 3 days\nORS Sachet — twice daily",
            "instructions": "Complete bed rest for 2–3 days. Avoid self-medication with antibiotics.",
        },
    ],
    "Cardiologist": [
        {
            "diagnosis": "Essential hypertension, stage 1",
            "medicines": "Tab. Amlodipine 5mg — 1 daily (morning)\nTab. Telmisartan 40mg — 1 daily (morning)\nTab. Aspirin 75mg — 1 daily after breakfast",
            "instructions": "Low-salt diet (< 5g/day). 30 minutes brisk walk daily. Avoid alcohol and smoking. Monitor BP daily.",
            "notes": "ECG and lipid profile due next visit.",
        },
        {
            "diagnosis": "Stable angina pectoris",
            "medicines": "Tab. Isosorbide Mononitrate SR 30mg — 1 daily\nTab. Atenolol 50mg — 1 daily\nTab. Rosuvastatin 10mg — 1 at bedtime\nTab. Aspirin 75mg — 1 daily after meals",
            "instructions": "Avoid strenuous activity. Carry sublingual nitrate at all times. Return immediately if chest pain worsens.",
        },
    ],
    "Dermatologist": [
        {
            "diagnosis": "Mild acne vulgaris",
            "medicines": "Adapalene 0.1% gel — thin layer on face every night\nClindamycin 1% gel — apply on active lesions twice daily\nTab. Doxycycline 100mg — 1 daily for 6 weeks",
            "instructions": "Use non-comedogenic sunscreen (SPF 30+) daily. Do not squeeze or pop pimples. Wash face twice a day with mild face wash.",
        },
        {
            "diagnosis": "Atopic dermatitis (eczema)",
            "medicines": "Betamethasone 0.05% cream — apply on patches twice daily for 7 days\nCetirizine 10mg — 1 at bedtime\nEmollient moisturiser (Cetaphil) — apply liberally thrice daily",
            "instructions": "Avoid hot showers and harsh soaps. Wear cotton clothing. Identify and avoid triggers.",
        },
    ],
    "Orthopedic": [
        {
            "diagnosis": "Lumbar spondylosis with mild nerve root compression",
            "medicines": "Tab. Diclofenac 50mg — 1 twice daily after food for 5 days\nTab. Thiocolchicoside 4mg — 1 twice daily for 7 days\nTab. Pantoprazole 40mg — 1 before breakfast (gastric cover)",
            "instructions": "Avoid lifting heavy weights. Use lumbar support belt. Physiotherapy exercises as instructed.",
            "notes": "MRI lumbar spine if no relief within 4 weeks.",
        },
        {
            "diagnosis": "Right knee osteoarthritis, grade II",
            "medicines": "Tab. Glucosamine Sulphate 1500mg — 1 daily with food\nTab. Etoricoxib 60mg — 1 daily after food (max 4 weeks)\nDiclofenac gel — apply and massage into knee twice daily",
            "instructions": "Avoid climbing stairs frequently. Quadricep strengthening exercises daily. Reduce body weight.",
        },
    ],
    "Pediatrician": [
        {
            "diagnosis": "Acute otitis media",
            "medicines": "Syr. Amoxicillin-Clavulanate 457mg/5ml — 5ml twice daily for 7 days\nSyr. Ibuprofen 100mg/5ml — 5ml thrice daily if pain\nOtrivin Paediatric nasal drops — 2 drops each nostril twice daily",
            "instructions": "Keep child's head elevated during sleep. Warm compress on ear for pain relief. Avoid exposing to noise.",
        },
        {
            "diagnosis": "Viral upper respiratory infection",
            "medicines": "Paracetamol drops 250mg/5ml — 2.5ml every 6 hours if fever\nSyr. Loratadine 5mg/5ml — 2.5ml once daily\nSaline nasal drops — 2 drops each nostril thrice daily",
            "instructions": "Plenty of fluids. Steam inhalation with adult supervision. Return if child is not eating or breathing difficulty.",
        },
    ],
    "Neurologist": [
        {
            "diagnosis": "Tension-type headache",
            "medicines": "Tab. Amitriptyline 10mg — 1 at bedtime (preventive)\nTab. Paracetamol 1g — 1 at onset of headache (max twice daily)\nTab. Propranolol 20mg — 1 twice daily",
            "instructions": "Maintain regular sleep schedule. Avoid screen time before bed. Relaxation techniques and meditation.",
            "notes": "Headache diary to be maintained. MRI brain if >4 episodes/month.",
        },
    ],
    "Gynecologist": [
        {
            "diagnosis": "Polycystic ovarian syndrome (PCOS)",
            "medicines": "Tab. Metformin 500mg — 1 twice daily with meals\nTab. Diane-35 (Ethinylestradiol + Cyproterone) — 1 daily for 21 days/cycle\nTab. Folic Acid 5mg — 1 daily",
            "instructions": "Low-carb diet. Regular 30-min aerobic exercise. Weight loss target of 5–10% over next 3 months.",
        },
    ],
    "Psychiatrist": [
        {
            "diagnosis": "Mild generalised anxiety disorder",
            "medicines": "Tab. Escitalopram 10mg — 1 daily (morning) for 3 months\nTab. Clonazepam 0.25mg — 1 at bedtime for 2 weeks only",
            "instructions": "Practice deep breathing exercises daily. Limit caffeine. Attend follow-up counselling sessions.",
            "notes": "Reassess medication need at 4-week follow-up.",
        },
    ],
    "Ophthalmologist": [
        {
            "diagnosis": "Allergic conjunctivitis",
            "medicines": "Olopatadine 0.1% eye drops — 1 drop each eye twice daily for 2 weeks\nFluorometholone 0.1% eye drops — 1 drop each eye thrice daily for 1 week\nArtificial tears — 1 drop each eye as needed",
            "instructions": "Avoid rubbing eyes. Cold compress for relief. Avoid dust and smoke. Do not share towels.",
        },
    ],
    "ENT": [
        {
            "diagnosis": "Allergic rhinitis with sinusitis",
            "medicines": "Fluticasone nasal spray — 2 sprays each nostril once daily\nTab. Levocetirizine 5mg — 1 at bedtime for 10 days\nTab. Montelukast 10mg — 1 at bedtime for 4 weeks\nSaline nasal rinse — twice daily",
            "instructions": "Avoid dust, pollen, and cold air. Use humidifier. Drink warm fluids.",
        },
    ],
    "Surgeon": [
        {
            "diagnosis": "Post-operative wound care (minor excision)",
            "medicines": "Tab. Amoxicillin-Clavulanate 625mg — 1 twice daily for 7 days\nTab. Ibuprofen 400mg — 1 thrice daily after food for 5 days\nPovidone Iodine 5% — clean wound once daily",
            "instructions": "Keep wound clean and dry. Change dressing every 2 days. Return immediately if redness or discharge increases.",
            "notes": "Suture removal in 7 days.",
        },
    ],
}

# Fallback for specialisations not listed
DEFAULT_PRESCRIPTIONS = [
    {
        "diagnosis": "Non-specific viral illness",
        "medicines": "Tab. Paracetamol 650mg — 1 every 6 hours if fever\nORS Sachet — twice daily\nVitamin C 500mg — 1 daily for 7 days",
        "instructions": "Rest well. Drink at least 2–3 litres of water daily.",
    },
    {
        "diagnosis": "Nutritional deficiency",
        "medicines": "Tab. Vitamin D3 60000IU — 1 weekly for 8 weeks\nTab. Calcium Carbonate 500mg + D3 — 1 twice daily\nTab. Iron (Ferrous Sulphate) 100mg — 1 daily",
        "instructions": "Eat iron-rich foods (spinach, dal, eggs). Spend 15 mins in morning sunlight.",
    },
]

# ─── Seeder ───────────────────────────────────────────────────────────────────
def seed_prescriptions():
    # Find all completed bookings that have NO prescription yet
    existing_booking_ids = {row.booking_id for row in db.query(Prescription).all()}
    completed_bookings = db.query(Booking).filter(Booking.status == "completed").all()

    to_seed = [b for b in completed_bookings if b.id not in existing_booking_ids]
    print(f"Found {len(completed_bookings)} completed bookings, {len(to_seed)} without prescriptions.")

    if not to_seed:
        print("All completed bookings already have prescriptions. Nothing to seed.")
        return

    added = 0
    for booking in to_seed:
        doctor = db.query(Doctor).filter(Doctor.id == booking.doctor_id).first()
        if not doctor:
            continue

        spec = doctor.specialization.value if doctor.specialization else ""
        templates = PRESCRIPTION_DATA.get(spec, DEFAULT_PRESCRIPTIONS)
        template = random.choice(templates)

        # Follow-up 1–4 weeks from the booking's slot date
        follow_up = None
        if booking.slot and random.random() > 0.4:
            follow_up = booking.slot.date + timedelta(days=random.randint(7, 28))

        prescription = Prescription(
            id=uuid.uuid4(),
            booking_id=booking.id,
            doctor_id=booking.doctor_id,
            patient_id=booking.patient_id,
            diagnosis=template.get("diagnosis"),
            medicines=template.get("medicines"),
            instructions=template.get("instructions"),
            follow_up_date=follow_up,
            notes=template.get("notes"),
        )
        db.add(prescription)
        added += 1

    db.commit()
    print(f"Done! Seeded {added} prescriptions successfully.")

if __name__ == "__main__":
    seed_prescriptions()
