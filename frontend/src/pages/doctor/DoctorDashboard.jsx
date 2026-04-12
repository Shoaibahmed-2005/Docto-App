import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import SubscriptionModal from '../../components/SubscriptionModal';

const STATUS_STYLES = {
  confirmed: 'bg-[#fef3c7] text-[#92400e]',
  completed: 'bg-[#d1fae5] text-[#065f46]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  no_show: 'bg-[#f3f4f6] text-[#374151]',
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [showPlans, setShowPlans] = useState(false);
  const [openSlotsCount, setOpenSlotsCount] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      try {
        const aps = await axios.get(`${API_URL}/doctors/me/appointments`, { headers: { Authorization: `Bearer ${token}` }});
        setAppointments(aps.data.data);
        const ern = await axios.get(`${API_URL}/doctors/me/earnings`, { headers: { Authorization: `Bearer ${token}` }});
        setEarnings(ern.data.data);
        const slt = await axios.get(`${API_URL}/doctors/me/slots`, { headers: { Authorization: `Bearer ${token}` }});
        const slotsData = Array.isArray(slt.data) ? slt.data : (slt.data?.data || []);
        const freeSlots = slotsData.filter(s => !s.is_booked);
        setOpenSlotsCount(freeSlots.length);
      } catch(e) {
        console.error(e);
      }
    };
    fetchDashboard();
  }, []);

  const todayAppts = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.slot?.date === today;
  });

  const stats = [
    { label: 'Bookings today', value: todayAppts.length, icon: '📅' },
    { label: 'Total earned', value: `₹${earnings?.total_earned || 0}`, icon: '💰' },
    { label: 'Rating', value: `${user?.avg_rating?.toFixed(1) || '—'} ★`, icon: '⭐' },
    { label: 'Open slots', value: openSlotsCount, icon: '🕐' },
  ];

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      {showPlans && <SubscriptionModal onClose={() => setShowPlans(false)} onSubscribe={() => setShowPlans(false)} />}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Dashboard
          </h1>
          <p className="text-[#9ca3af] text-sm mt-1">Welcome back, {user?.full_name?.split(' ')[0]}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-[#9ca3af] text-xs font-medium uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-semibold text-[#111827] mt-1" style={{ fontFamily: 'Instrument Serif, serif' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <h2 className="text-xl text-[#111827] mb-4" style={{ fontFamily: 'Instrument Serif, serif' }}>
              Today's Schedule
            </h2>
            <div className="space-y-3">
              {todayAppts.length === 0 ? (
                <div className="bg-[#f8f9fb] rounded-2xl border border-[#e5e7eb] p-8 text-center">
                  <p className="text-[#9ca3af] text-sm">No appointments scheduled for today.</p>
                  <Link to="/doctor/slots" className="mt-3 inline-block text-sm text-[#111827] underline underline-offset-2">
                    Manage your slots →
                  </Link>
                </div>
              ) : (
                todayAppts.map((a, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center text-sm font-medium text-[#374151]" style={{ fontFamily: 'Instrument Serif, serif' }}>
                        {a.patient?.full_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-medium text-[#111827] text-sm">{a.patient?.full_name}</p>
                        <p className="text-xs text-[#9ca3af]">{a.slot?.start_time?.slice(0, 5)} – {a.slot?.end_time?.slice(0, 5)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[a.booking?.status] || STATUS_STYLES.confirmed}`}>
                        {a.booking?.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Subscription Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5">
              <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-3">Subscription</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-[#111827]">Free Plan</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#374151]">Active</span>
              </div>
              <p className="text-xs text-[#9ca3af] mt-2">
                Upgrade to appear higher in search results and unlock analytics.
              </p>
              <button
                id="view-plans-btn"
                onClick={() => setShowPlans(true)}
                className="w-full mt-4 bg-[#111827] text-white rounded-full py-2.5 text-sm font-medium hover:bg-[#374151] transition"
              >
                View Plans
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5 space-y-2">
              <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-3">Quick Links</p>
              {[
                { to: '/doctor/slots', label: 'Manage Slots' },
                { to: '/doctor/appointments', label: 'All Appointments' },
                { to: '/doctor/earnings', label: 'Earnings' },
                { to: '/doctor/settings', label: 'Settings' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="flex items-center justify-between py-2 text-sm text-[#374151] hover:text-[#111827] border-b border-[#f3f4f6] last:border-0 transition-colors">
                  {link.label}
                  <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
