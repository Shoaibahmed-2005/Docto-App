import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, useAuth } from '../contexts/AuthContext';

const specialties = ["General Physician", "Pediatrician", "Gynecologist", "Surgeon", "Cardiologist", "Dermatologist", "Orthopedic", "Neurologist", "Psychiatrist", "Ophthalmologist", "ENT", "Dentist"];

const ROLES = ['patient', 'doctor'];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('patient');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Personal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Professional (doctor only)
  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');

  // Step 3: Clinic (doctor only)
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  const maxSteps = role === 'doctor' ? 3 : 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === 'doctor' && step < maxSteps) {
      setStep(s => s + 1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        full_name: name, email, phone, password,
        ...(role === 'doctor' && {
          specialization, qualifications,
          experience_years: parseInt(experienceYears) || 0,
          bio, clinic_name: clinicName, clinic_address: clinicAddress,
          consultation_fee: parseFloat(consultationFee) || 0,
        })
      };
      await axios.post(`${API_URL}/auth/register/${role}`, payload);
      const data = await login(email, password);
      if (data.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', '));
        } else {
          setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
        }
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: `radial-gradient(ellipse at 20% 50%, #c8ede9 0%, transparent 55%),
                     radial-gradient(ellipse at 80% 20%, #d0f0ec 0%, transparent 55%), #fff`
      }}
    >
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/"><img src="/doctonewlogo.jpeg" alt="Docto" className="h-16 md:h-20 w-auto" /></Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-8">
          <h1 className="text-2xl text-[#0d2b28] mb-1 text-center">
            Create account
          </h1>
          <p className="text-sm text-[#9ca3af] text-center mb-6">Join Docto today</p>

          {/* Role Selector */}
          <div className="flex gap-1 bg-[#f8f9fb] rounded-full p-1 w-fit mx-auto mb-6 border border-[#e5e7eb]">
            {ROLES.map(r => (
              <button
                key={r}
                type="button"
                id={`register-role-${r}`}
                onClick={() => { setRole(r); setStep(1); }}
                className={`px-6 py-2 rounded-full text-sm font-medium capitalize transition-all ${role === r ? 'bg-[#1a9e8f] text-white shadow-sm' : 'text-[#5a7370] hover:text-[#1a9e8f]'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Progress for doctor */}
          {role === 'doctor' && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${s === step ? 'bg-[#1a9e8f] text-white' : s < step ? 'bg-[#10b981] text-white' : 'bg-[#f3f4f6] text-[#9ca3af]'
                    }`}>
                    {s < step ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-[#10b981]' : 'bg-[#f3f4f6]'}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Full Name</label>
                    <input id="register-name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder={role === 'doctor' ? "Dr. Arjun Kumar" : "Arjun Kumar"} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Phone</label>
                    <input id="register-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Email</label>
                  <input id="register-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Password</label>
                  <input id="register-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                </div>
              </>
            )}

            {/* Step 2: Professional (doctor) */}
            {step === 2 && role === 'doctor' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Specialization</label>
                  <select id="register-specialization" required value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]">
                    <option value="">Select specialty</option>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Qualifications</label>
                  <input id="register-qualifications" type="text" value={qualifications} onChange={e => setQualifications(e.target.value)} placeholder="MBBS, MD" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Years of Experience</label>
                  <input id="register-experience" type="number" min="0" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="e.g. 10" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Bio</label>
                  <textarea id="register-bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell patients about yourself…" rows={3} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28] resize-none" />
                </div>
              </>
            )}

            {/* Step 3: Clinic (doctor) */}
            {step === 3 && role === 'doctor' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Clinic Name</label>
                  <input id="register-clinic-name" type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="Apollo Clinic" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Clinic Address</label>
                  <input id="register-clinic-address" type="text" value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} placeholder="123, Anna Salai, Chennai" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Consultation Fee (₹)</label>
                  <input id="register-fee" type="number" min="0" value={consultationFee} onChange={e => setConsultationFee(e.target.value)} placeholder="500" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]" />
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 border border-[#c8e8e5] text-[#1a9e8f] rounded-full py-3 text-sm font-medium hover:bg-[#e6f7f5] transition"
                >
                  Back
                </button>
              )}
              <button
                id="register-next-btn"
                type="submit"
                disabled={loading}
                className={`flex-1 rounded-full py-3 text-sm font-medium transition ${loading ? 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed' : 'bg-[#1a9e8f] text-white hover:bg-[#158577]'
                  }`}
              >
                {loading ? 'Creating account…' : step < maxSteps ? `Next — Step ${step + 1} of ${maxSteps}` : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-[#9ca3af] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1a9e8f] font-medium underline underline-offset-2 hover:text-[#158577] transition">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

