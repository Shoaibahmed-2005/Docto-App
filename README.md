<div align="center">
  <h1>🩺 Docto - Full-Stack Healthcare Platform</h1>
  <p>A modern, comprehensive platform for booking doctor appointments, managing prescriptions, and connecting patients with medical professionals.</p>

  <!-- Badges -->
  <a href="https://doctofrontend.netlify.app/"><img src="https://img.shields.io/badge/Live_Demo-Frontend-00C7B7?style=for-the-badge&logo=netlify" alt="Netlify Live" /></a>
  <a href="https://docto-app-backend.onrender.com/docs"><img src="https://img.shields.io/badge/Live_API-Backend-000000?style=for-the-badge&logo=render" alt="Render API" /></a>
  <a href="https://irasqgwshohvjmvpdtbg.supabase.co"><img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" /></a>
</div>

<br />

## 🚀 Live Deployments

- **Frontend Application:** [https://doctofrontend.netlify.app/](https://doctofrontend.netlify.app/)
- **Backend API Docs (Swagger UI):** [https://docto-app-backend.onrender.com/docs](https://docto-app-backend.onrender.com/docs)
- **Supabase Instance:** [https://irasqgwshohvjmvpdtbg.supabase.co](https://irasqgwshohvjmvpdtbg.supabase.co)

---

## 🌟 Key Features

### 🧑‍⚕️ For Patients
* **Smart Search & Filter:** Find doctors by specialty, availability, and location using Google Maps API.
* **Instant Booking System:** Book dynamic time slots with real-time availability updates.
* **Secure Payments:** Integrated with Razorpay for seamless appointment fee transactions.
* **Digital Medical History:** Access past bookings, digital prescriptions, and leave reviews.

### ⚕️ For Doctors
* **Advanced Dashboard:** Monitor daily appointments, patient history, and total earnings.
* **Slot Management:** Configure flexible working hours and session durations.
* **Digital Prescriptions:** Generate, upload, and attach digital prescriptions directly to patient profiles.
* **Subscription Tiers:** Upgrade to premium tiers for better visibility and reduced platform commissions.

### 🛡️ For Admins
* **Platform Oversight:** Monitor all users, doctors, and financial transactions.
* **Financial Dashboard:** Track platform commissions and automated advance-payment logic.

---

## 🛠️ Technology Stack

**Frontend (Client)**
* **Framework:** React 19 / Vite
* **Styling:** Tailwind CSS v4
* **Routing:** React Router v7
* **Mapping:** Google Maps JS API

**Backend (Server)**
* **Framework:** Python / FastAPI
* **ORM:** SQLAlchemy 2.0
* **Authentication:** JWT (JSON Web Tokens) with Bcrypt
* **Payment Gateway:** Razorpay SDK

**Database (Cloud)**
* **Provider:** Supabase (PostgreSQL)
* **Connection:** IPv4 Session Pooling (`psycopg2`)

---

## 📂 Repository Structure

```text
📦 docto
 ┣ 📂 frontend/         # React + Vite Client Application
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 components/   # Reusable UI components (Navbar, Footers, Cards)
 ┃ ┃ ┣ 📂 pages/        # Route pages (Doctor, Patient, Admin flows)
 ┃ ┃ ┗ 📜 main.jsx      # React entry point
 ┃ ┗ 📜 package.json    # Frontend dependencies
 ┃
 ┣ 📂 backend/          # FastAPI Python Server
 ┃ ┣ 📂 routers/        # API Endpoints (auth, doctors, patients, etc.)
 ┃ ┣ 📜 main.py         # FastAPI application entry point
 ┃ ┣ 📜 models.py       # SQLAlchemy database schemas
 ┃ ┣ 📜 database.py     # Supabase connection configuration
 ┃ ┗ 📜 requirements.txt# Backend dependencies
 ┃
 ┗ 📜 README.md         # You are here!
```

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/docto.git
cd docto
```

### 2. Setup Backend
```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory with:
```env
DATABASE_URL=postgresql://...
SECRET_KEY=your_secret_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
Run the backend server:
```bash
uvicorn main:app --reload
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend/` directory with:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_RAZORPAY_KEY_ID=your_razorpay_id
```
Start the frontend development server:
```bash
npm run dev
```

---
<div align="center">
  <i>Built with ❤️ for modern healthcare management.</i>
</div>
