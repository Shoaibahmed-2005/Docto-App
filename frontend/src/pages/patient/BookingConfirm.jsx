import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';
import { formatDoctorName } from '../../utils/identityUtils';

export default function BookingConfirm() {
  const { id } = useParams(); // Slot ID
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor, selectedSlot, isEmergency } = location.state || {}; // Passed from DoctorProfile
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!doctor || !selectedSlot) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-[#0d2b28] font-medium">Invalid booking parameters</p>
          <p className="text-sm text-[#9ca3af] mt-1">Please go back and select a slot.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 border border-[#c8e8e5] text-[#1a9e8f] rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#e6f7f5] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/bookings`, { doctor_id: doctor.id, slot_id: selectedSlot.id, is_emergency: isEmergency || false }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });

      const order = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Docto Setup",
        description: `Advance for appointment with ${doctor.full_name}`,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API_URL}/bookings/${order.booking_id}/confirm-payment`, null, {
              params: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_order_id: response.razorpay_order_id
              },
              headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            alert("Booking Confirmed!");
            navigate('/patient/bookings');
          } catch (err) {
            setError("Payment confirmation failed. Check your network.");
          }
        },
        prefill: { name: user?.full_name || '', email: user?.email || '' },
        theme: { color: "#1a9e8f" }
      };

      if (window.Razorpay) {
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        setError("Razorpay SDK not loaded.");
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to create booking order.");
    } finally {
      setLoading(false);
    }
  };

  const base_fee = doctor.consultation_fee || 0;
  const fee = isEmergency ? Math.round(base_fee * 1.25) : base_fee;
  const advance = Math.round(fee * 0.3);
  const balance = fee - advance;

  const initials = doctor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DR';

  const formatSlotDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#9ca3af] hover:text-[#158577] transition mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl text-[#0d2b28]">
            Confirm Appointment
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-2xl text-sm text-[#ef4444]">
            {error}
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 mb-4">
          {/* Doctor */}
          <div className="flex items-center gap-4 pb-5 border-b border-[#e5e7eb]">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-[#e6f7f5] border border-[#c8e8e5] flex-shrink-0">
              {doctor.profile_photo ? (
                <img src={doctor.profile_photo} alt={doctor.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1a9e8f] text-lg font-medium">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-[#0d2b28]">{formatDoctorName(doctor.full_name)}</p>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#e6f7f5] text-[#1a9e8f] mt-1 inline-block">
                {doctor.specialization}
              </span>
            </div>
          </div>

          {/* Date/Time */}
          <div className="py-5 border-b border-[#e5e7eb] space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6b7280]">Date</span>
              <span className="font-medium text-[#0d2b28]">{formatSlotDate(selectedSlot.date)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6b7280]">Time</span>
              <span className="font-medium text-[#0d2b28]">
                {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="py-4 border-b border-[#e5e7eb] space-y-2">
            <div className="flex justify-between items-start text-sm">
              <span className="text-[#6b7280]">Location</span>
              {selectedSlot.is_online ? (
                <span className="font-medium text-[#1e40af] flex items-center gap-1.5 bg-[#eff6ff] px-2.5 py-1 rounded-md border border-[#bfdbfe]">
                  <svg className="w-3.5 h-3.5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Online Video
                </span>
              ) : (
                <span className="font-medium text-[#0d2b28] text-right line-clamp-2 max-w-[200px]">
                  {doctor.clinic_address || doctor.clinic_name || 'Clinic Visit'}
                </span>
              )}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="pt-5 space-y-3">
            <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-3">Fee Breakdown</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6b7280]">
                Consultation fee
                {isEmergency && <span className="text-xs bg-[#fee2e2] text-[#991b1b] px-2 py-0.5 rounded-md ml-2 font-medium shadow-sm">Emergency (+25%)</span>}
              </span>
              <span className="text-[#0d2b28] font-medium">&#8377;{fee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6b7280]">Advance now (30%)</span>
              <span className="text-[#10b981] font-semibold">&#8377;{advance}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-[#e5e7eb]">
              <span className="text-[#6b7280]">Balance due</span>
              <span className="text-[#9ca3af]">&#8377;{balance}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#9ca3af] text-center mb-5">
          * Advance secures your slot and prevents no-shows.
        </p>

        {/* Pay Button */}
        <button
          id="pay-advance-btn"
          onClick={handleBooking}
          disabled={loading}
          className={`w-full py-3.5 rounded-full text-sm font-medium transition-all ${loading
              ? 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed'
              : 'bg-[#1a9e8f] text-white hover:bg-[#158577]'
            }`}
        >
          {loading ? 'Processing…' : `Proceed to Pay ₹${advance}`}
        </button>
      </div>
    </div>
  );
}


