import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatDoctorName } from '../../utils/identityUtils';
import StarRating from '../../components/StarRating';

// ─── Prescription Viewer Modal ────────────────────────────────────────────────
function PrescriptionViewer({ prescription, onClose, user }) {
  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const canDownload = user?.subscription_plan === 'annual' || user?.subscription_plan === 'enterprise';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-8 pb-6 border-b border-[#e5e7eb] bg-gradient-to-br from-white to-[#f0faf9]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e7eb] flex items-center justify-center shadow-sm">
              <span className="text-xl font-bold italic text-[#1a9e8f]">Rx</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0d2b28] tracking-tight">Prescription Details</h2>
              <p className="text-xs text-[#9ca3af] font-bold uppercase tracking-widest mt-0.5">{formatDoctorName(prescription.doctor?.full_name)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-[#9ca3af] hover:text-[#0d2b28] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
          {/* Top Info Grid */}
          <div className="grid grid-cols-2 gap-6 p-5 bg-[#f8f9fb] rounded-2xl border border-[#e5e7eb]">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em]">Issued Date</p>
                <p className="text-sm font-bold text-[#0d2b28]">{fmt(prescription.created_at?.split('T')[0])}</p>
             </div>
             {prescription.follow_up_date && (
                <div className="space-y-1 border-l border-[#e5e7eb] pl-6 text-right">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Follow-up Recommendation</p>
                  <p className="text-sm font-bold text-[#0d2b28]">{fmt(prescription.follow_up_date)}</p>
                </div>
             )}
          </div>

          {/* Diagnosis */}
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a9e8f]" />
                <h3 className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em]">Clinical Assessment</h3>
             </div>
             <p className="text-base font-bold text-[#0d2b28] leading-relaxed bg-[#f0faf9] p-5 rounded-2xl border border-[#c8e8e5]">{prescription.diagnosis}</p>
          </div>

          {/* Medication Table Style */}
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a9e8f]" />
                <h3 className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em]">Prescribed Medications</h3>
             </div>
             <div className="space-y-3">
                {prescription.medicines.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white border border-[#e5e7eb] rounded-2xl shadow-sm hover:border-[#1a9e8f] transition-colors">
                     <span className="w-8 h-8 rounded-xl bg-[#f0faf9] text-[#1a9e8f] flex items-center justify-center text-xs font-bold">{i+1}</span>
                     <p className="text-sm font-bold text-[#374151] font-mono tracking-tight">{line}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Advice */}
          {prescription.instructions && (
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a9e8f]" />
                  <h3 className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em]">General Advice</h3>
               </div>
               <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 italic text-sm text-amber-900 leading-relaxed shadow-sm">
                 "{prescription.instructions}"
               </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-10 py-8 bg-gray-50/50 border-t border-[#e5e7eb] flex items-center justify-between">
           {canDownload ? (
              <button className="flex items-center gap-2 px-8 py-3.5 bg-[#0d2b28] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-[#0d2b28]/10">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Download Medical Report
              </button>
           ) : (
              <button onClick={() => navigate('/pricing')} className="flex items-center gap-2 px-8 py-3.5 bg-amber-400 text-[#0d2b28] rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all">
                🌟 Unlock PDF Download
              </button>
           )}
           <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-[#9ca3af] hover:text-[#0d2b28] transition-colors">Close View</button>
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  confirmed: 'bg-[#d1fae5] text-[#065f46]',
  pending: 'bg-[#fef3c7] text-[#92400e]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  completed: 'bg-[#e6f7f5] text-[#1a9e8f]',
  no_show: 'bg-[#fee2e2] text-[#991b1b]',
};

const TABS = ['upcoming', 'completed', 'cancelled', 'missed'];

const CancelCountdown = ({ booking, slot, status }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!booking || !slot || !['confirmed', 'pending'].includes(status)) return;
    const calculate = () => {
      const bookedAt = new Date(booking.created_at);
      const cancelDeadline = new Date(bookedAt.getTime() + 6 * 3600 * 1000);
      const slotTime = new Date(`${slot.date}T${slot.start_time}`);
      const now = new Date();
      
      if (now.getTime() > slotTime.getTime() || now.getTime() > cancelDeadline.getTime()) {
        setTimeLeft('Closed');
        return;
      }
      
      const diffMs = cancelDeadline.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${diffHrs}h ${diffMins}m left`);
    };
    
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [booking, slot, status]);

  if (!['confirmed', 'pending'].includes(status)) return null;
  if (!timeLeft) return null;
  
  return (
    <div className={`mt-3 text-xs font-medium px-2.5 py-1.5 inline-flex items-center gap-1.5 rounded-lg border ${timeLeft === 'Closed' ? 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]' : 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'}`}>
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {timeLeft === 'Closed' ? 'Cancellation window closed' : `Cancel window closes in: ${timeLeft}`}
    </div>
  );
};

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Per-booking review state
  const [reviewOpen, setReviewOpen] = useState(null);   // booking id
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewedIds, setReviewedIds] = useState(new Set()); // already reviewed
  const [prescriptions, setPrescriptions] = useState({}); // bookingId -> prescription object
  const [lockedPrescriptions, setLockedPrescriptions] = useState({}); // bookingId -> lock message
  const [viewPrescription, setViewPrescription] = useState(null); // prescription obj

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/patients/me/bookings`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      const data = res.data.data || [];
      setBookings(data);

      const completedIds = data.filter(b => b.booking.status === 'completed').map(b => b.booking.id);
      const rxMap = {};
      const lockedMap = {};
      await Promise.all(completedIds.map(async (id) => {
        try {
          const rxRes = await axios.get(`${API_URL}/prescriptions/booking/${id}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
          });
          rxMap[id] = rxRes.data;
        } catch (err) {
          if (err.response?.status === 403) {
            lockedMap[id] = err.response.data.detail.message || "Upgrade required";
          }
        }
      }));
      setPrescriptions(rxMap);
      setLockedPrescriptions(lockedMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.post(`${API_URL}/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel booking.');
      fetchBookings();
    }
  };

  const handleRemovePending = async (bookingId) => {
    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove booking.');
    }
  };

  const filterBookings = (tab) => {
    if (tab === 'upcoming') return bookings.filter(b => ['confirmed', 'pending'].includes(b.booking.status));
    if (tab === 'completed') return bookings.filter(b => b.booking.status === 'completed');
    if (tab === 'cancelled') return bookings.filter(b => b.booking.status === 'cancelled');
    if (tab === 'missed') return bookings.filter(b => b.booking.status === 'no_show');
    return bookings;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const openReview = (bookingId) => {
    setReviewOpen(bookingId);
    setReviewRating(5);
    setReviewText('');
    setReviewError('');
  };

  const submitReview = async (bookingId) => {
    if (!reviewText.trim()) {
      setReviewError('Please write a short review before submitting.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await axios.post(
        `${API_URL}/reviews`,
        { booking_id: bookingId, rating: reviewRating, review_text: reviewText.trim() },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );
      setReviewedIds(prev => new Set([...prev, bookingId]));
      setReviewOpen(null);
      setReviewText('');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setReviewError(typeof detail === 'string' ? detail : 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filtered = filterBookings(activeTab);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#1a9e8f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          My Appointments
        </h1>

        {/* Tab Strip */}
        <div className="flex gap-2 bg-[#f3f4f6] rounded-2xl p-1.5 w-fit mb-10 border border-[#e5e7eb] shadow-inner">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`bookings-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#0d2b28] text-white shadow-lg'
                  : 'text-[#9ca3af] hover:text-[#0d2b28] hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Booking List */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f8f9fb] border border-[#e5e7eb] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[#9ca3af] text-sm">No {activeTab} appointments.</p>
            {activeTab === 'upcoming' && (
              <Link to="/" className="mt-4 inline-block bg-[#1a9e8f] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#158577] transition">
                Find a Doctor
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => {
              const baseFee = b.doctor?.consultation_fee || 0;
              const total = b.booking.is_emergency ? baseFee * 1.25 : baseFee;
              const finalFee = b.booking.delay_minutes > 0 ? total * 0.9 : total;
              const balance = Math.max(0, finalFee - b.booking.advance_amount);
              
              return (
              <div key={b.booking.id} className="bg-white rounded-[2.5rem] border border-[#e5e7eb] shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-10 relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1a9e8f]/5 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex items-start justify-between gap-10">
                  <div className="flex-grow space-y-8">
                    {/* Header Info */}
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-white border border-[#e5e7eb] shadow-sm flex items-center justify-center text-2xl font-bold text-[#1a9e8f] group-hover:scale-105 transition-transform duration-500">
                        {b.doctor?.full_name?.charAt(0) || 'D'}
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-[#1a9e8f] uppercase tracking-[0.2em] mb-1">{b.doctor?.specialization}</p>
                         <h3 className="text-2xl font-bold text-[#0d2b28] tracking-tight">{formatDoctorName(b.doctor?.full_name)}</h3>
                      </div>
                    </div>

                    {/* Schedule Block */}
                    <div className="flex flex-wrap items-center gap-6 bg-[#f8f9fb] p-6 rounded-3xl border border-[#e5e7eb]">
                       <div className="flex items-center gap-3">
                          <span className="text-xl">📅</span>
                          <div>
                            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Date</p>
                            <p className="text-sm font-bold text-[#0d2b28]">{formatDate(b.slot?.date)}</p>
                          </div>
                       </div>
                       <div className="w-px h-8 bg-[#e5e7eb]" />
                       <div className="flex items-center gap-3">
                          <span className="text-xl">⏰</span>
                          <div>
                            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Time Slot</p>
                            <p className="text-sm font-bold text-[#0d2b28]">{formatTime(b.slot?.start_time)}</p>
                          </div>
                       </div>
                       <div className="w-px h-8 bg-[#e5e7eb]" />
                       <div className="flex items-center gap-3">
                          <span className="text-xl">{b.slot?.is_online ? '💻' : '🏥'}</span>
                          <div>
                            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Type</p>
                            <p className="text-sm font-bold text-[#1a9e8f]">{b.slot?.is_online ? 'Video Consult' : 'Clinic Visit'}</p>
                          </div>
                       </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                       <span className="px-5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold uppercase tracking-widest">
                          Advance Paid: ₹{b.booking.advance_amount}
                       </span>
                       <span className="px-5 py-2 bg-[#0d2b28] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#0d2b28]/10">
                          Balance Due: ₹{balance.toFixed(0)}
                       </span>
                    </div>

                    {b.booking.delay_minutes > 0 && (
                      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm border border-amber-100 animate-pulse">⏳</div>
                        <div>
                           <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Schedule Insight</p>
                           <p className="text-sm font-bold text-[#0d2b28]">Wait requested ({b.booking.delay_minutes}m) &middot; <span className="text-emerald-600">10% Credit Applied</span></p>
                        </div>
                      </div>
                    )}
                    
                    {b.booking.status === 'no_show' && (
                      <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm border border-red-100">⚠️</div>
                        <div>
                           <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Non-Refundable Appointment</p>
                           <p className="text-sm font-bold text-[#0d2b28]">For missed consultations, your advance payment cannot be refunded.</p>
                        </div>
                      </div>
                    )}

                    {b.booking.status === 'cancelled' && (
                      (() => {
                        const cancelledAt = new Date(b.booking.cancelled_at);
                        const now = new Date();
                        const isRefunded = (now - cancelledAt) > 3600 * 1000;
                        return (
                          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm border border-emerald-100 text-emerald-600">
                              {isRefunded ? '✅' : '💸'}
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                                 {isRefunded ? 'Refund Successful' : 'Refund in Progress'}
                               </p>
                               <p className="text-sm font-bold text-[#0d2b28]">
                                 {isRefunded 
                                   ? `Your advance amount of ₹${b.booking.advance_amount} has been successfully refunded.`
                                   : `Your advance amount of ₹${b.booking.advance_amount} will be refunded within 1 hour.`}
                               </p>
                            </div>
                          </div>
                        );
                      })()
                    )}
                    
                    <CancelCountdown booking={b.booking} slot={b.slot} status={b.booking.status} />
                  </div>

                  {/* Sidebar Actions */}
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-xl border ${STATUS_STYLES[b.booking.status] || STATUS_STYLES.pending} shadow-sm`}>
                      {b.booking.status === 'no_show' ? 'MISSED' : b.booking.status === 'pending' ? 'PAYMENT PENDING' : b.booking.status}
                    </span>
                    
                    <div className="flex flex-col gap-2 mt-2 w-full">
                      {b.booking.status === 'confirmed' && b.slot?.is_online && (
                        <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="w-full bg-[#2563eb] text-white rounded-2xl py-4 text-[10px] font-bold uppercase tracking-widest text-center shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform">
                          Join Link
                        </a>
                      )}
                      
                      {b.booking.status === 'confirmed' && (
                        (() => {
                          const bookedAt = new Date(b.booking.created_at);
                          const cancelDeadline = new Date(bookedAt.getTime() + 6 * 3600 * 1000);
                          const slotTime = new Date(`${b.slot?.date}T${b.slot?.start_time}`);
                          const now = new Date();
                          
                          if (now < cancelDeadline && now < slotTime) {
                            return (
                              <button onClick={() => handleCancel(b.booking.id)} className="w-full text-red-400 bg-red-50 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors">
                                Cancel Appointment
                              </button>
                            );
                          }
                          return null;
                        })()
                      )}

                      {b.booking.status === 'pending' && (
                        <button onClick={() => handleRemovePending(b.booking.id)} className="w-full text-red-500 bg-red-50 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors border border-red-100">
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Leave Review (completed) */}
                {b.booking.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                    {/* View Prescription button */}
                    {lockedPrescriptions[b.booking.id] ? (
                      <div className="mb-3">
                        <button
                          onClick={() => navigate('/pricing')}
                          className="flex items-center gap-1.5 border border-[#fde68a] text-[#b45309] bg-[#fffbeb] rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#fef3c7] transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          Prescription Locked
                        </button>
                        <p className="text-[10px] text-[#9ca3af] mt-1 italic ml-1">{lockedPrescriptions[b.booking.id]}</p>
                      </div>
                    ) : prescriptions[b.booking.id] && (
                      <button
                        id={`view-rx-${b.booking.id}`}
                        onClick={() => setViewPrescription(prescriptions[b.booking.id])}
                        className="mb-3 flex items-center gap-1.5 border border-[#c8e8e5] text-[#1a9e8f] bg-[#f0fdf9] rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#e6f7f5] transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        View Prescription
                      </button>
                    )}
                    {reviewedIds.has(b.booking.id) ? (
                      <p className="text-sm text-[#1a9e8f] font-medium flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Review submitted &mdash; thank you!
                      </p>
                    ) : reviewOpen === b.booking.id ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[#6b7280] font-medium mb-2">Your rating</p>
                          <StarRating rating={reviewRating} setRating={setReviewRating} />
                        </div>
                        <textarea
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          placeholder="Share your experience with this doctor&hellip;"
                          className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white resize-none"
                          rows={3}
                        />
                        {reviewError && (
                          <p className="text-xs text-[#ef4444]">{reviewError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            id={`submit-review-${b.booking.id}`}
                            onClick={() => submitReview(b.booking.id)}
                            disabled={reviewSubmitting}
                            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                              reviewSubmitting
                                ? 'bg-[#e6f7f5] text-[#9ca3af] cursor-not-allowed'
                                : 'bg-[#1a9e8f] text-white hover:bg-[#158577]'
                            }`}
                          >
                            {reviewSubmitting ? 'Submitting&hellip;' : 'Submit Review'}
                          </button>
                          <button
                            onClick={() => { setReviewOpen(null); setReviewError(''); }}
                            className="border border-[#e5e7eb] text-[#5a7370] rounded-full px-5 py-2 text-sm font-medium hover:bg-[#f8f9fb] transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        id={`leave-review-${b.booking.id}`}
                        onClick={() => openReview(b.booking.id)}
                        className="border border-[#c8e8e5] text-[#1a9e8f] rounded-full px-5 py-2 text-sm font-medium hover:bg-[#e6f7f5] transition"
                      >
                        Leave a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>

    {/* Prescription Viewer */}
    {viewPrescription && (
      <PrescriptionViewer prescription={viewPrescription} onClose={() => setViewPrescription(null)} user={user} />
    )}
    </>
  );
}


