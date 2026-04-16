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
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = sessionStorage.getItem('token');
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
    
    // Auto-fetch patients on mount
    const fetchPatientsInitial = async () => {
      setSearching(true);
      try {
        const res = await axios.get(`${API_URL}/doctors/me/patients/search`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        setPatients(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Error auto-fetching history", e);
      } finally {
        setSearching(false);
      }
    };
    fetchPatientsInitial();
  }, []);

  const todayAppts = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.slot?.date === today;
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await axios.get(`${API_URL}/doctors/me/patients/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setPatients(res.data);
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  };

  const stats = [
    { label: 'Bookings today', value: todayAppts.length, icon: '📅' },
    { label: 'Total earned', value: `₹${earnings?.total_earned || 0}`, icon: '💰' },
    { label: 'Rating', value: `${user?.avg_rating?.toFixed(1) || '—'} ★`, icon: '⭐' },
    { label: 'Open slots', value: openSlotsCount, icon: '🕒' },
  ];

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      {showPlans && <SubscriptionModal onClose={() => setShowPlans(false)} onSubscribe={() => setShowPlans(false)} />}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-[#0d2b28]">
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
              <p className="text-2xl font-semibold text-[#0d2b28] mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <h2 className="text-xl text-[#0d2b28] mb-4">
              Today's Schedule
            </h2>
            <div className="space-y-3">
              {todayAppts.length === 0 ? (
                <div className="bg-[#f8f9fb] rounded-2xl border border-[#e5e7eb] p-8 text-center">
                  <p className="text-[#9ca3af] text-sm">No appointments scheduled for today.</p>
                  <Link to="/doctor/slots" className="mt-3 inline-block text-sm text-[#1a9e8f] underline underline-offset-2">
                    Manage your slots →
                  </Link>
                </div>
              ) : (
                todayAppts.map((a, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e6f7f5] border border-[#c8e8e5] flex items-center justify-center text-sm font-medium text-[#1a9e8f]">
                        {a.patient?.full_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-medium text-[#0d2b28] text-sm">{a.patient?.full_name}</p>
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

            {/* Patient History section */}
            <div className="mt-8">
              <h2 className="text-xl text-[#0d2b28] mb-4">Patient History Search</h2>
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by patient name..."
                    className="w-full border border-[#e5e7eb] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f]"
                  />
                  <svg className="w-5 h-5 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1a9e8f] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#158577]">
                    Search
                  </button>
                </div>
              </form>

              {searching ? (
                <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-[#1a9e8f] border-t-transparent rounded-full animate-spin"/></div>
              ) : patients.length > 0 ? (
                <div className="space-y-4">
                  {patients.map(p => (
                    <div key={p.patient.id} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5">
                      <div className="flex items-center gap-3 border-b border-[#e5e7eb] pb-3 mb-3">
                         <div className="w-10 h-10 rounded-full bg-[#e6f7f5] text-[#1a9e8f] flex items-center justify-center font-medium">
                           {p.patient.full_name?.charAt(0)}
                         </div>
                         <h3 className="font-semibold text-[#0d2b28]">{p.patient.full_name}</h3>
                      </div>
                      
                      {p.plan_limit_message && (
                        <div className="mb-4 bg-[#fffbeb] text-[#b45309] border border-[#fde68a] px-3 py-2 rounded-lg flex items-start gap-2 text-xs">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          <div>
                            <p className="font-semibold">{p.plan_limit_message}</p>
                            <button onClick={() => setShowPlans(true)} className="mt-1 text-[#b45309] font-semibold underline underline-offset-2">Upgrade now to unlock.</button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 border-l-2 border-[#f3f4f6] pl-4 ml-1">
                        {p.history.map(item => (
                          <div key={item.booking_id} className="relative">
                            <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#1a9e8f] ring-4 ring-white" />
                            <div className="bg-[#f8f9fb] rounded-xl p-3 border border-[#e5e7eb]">
                              <p className="text-xs font-semibold text-[#4b5563] mb-1">{item.date} at {item.start_time?.slice(0, 5)}</p>
                              
                              {item.diagnosis && <p className="text-sm font-medium text-[#0d2b28] mb-1">Diagnosis: {item.diagnosis}</p>}
                              
                              {item.medicines && <div className="mt-2 text-sm text-[#374151] font-mono whitespace-pre-line border-l-2 border-[#c8e8e5] pl-2">{item.medicines}</div>}
                              {(!item.medicines && p.history.some(h => h.medicines)) && <p className="mt-2 text-xs text-[#9ca3af] italic italic flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Medicines hidden. Upgrade required.</p>}
                              
                              {item.instructions && <div className="mt-2 text-sm bg-white p-2 rounded border border-[#e5e7eb]">Instructions: {item.instructions}</div>}
                              {item.notes && <div className="mt-2 text-sm bg-white p-2 text-[#9ca3af] italic border border-[#e5e7eb] rounded">Notes: {item.notes}</div>}
                              
                              {item.follow_up_date && <p className="text-xs font-semibold text-[#1a9e8f] mt-2">Follow-up: {item.follow_up_date}</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {p.is_truncated && (
                        <div className="mt-3 text-center">
                          <p className="text-xs text-[#9ca3af] italic flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Older history hidden by plan limits.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: Subscription Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5">
              <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-3">Subscription</p>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0d2b28] capitalize">
                    {user?.subscription_plan ? `${user.subscription_plan} Plan` : 'Free Plan'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] font-bold">Active</span>
                </div>
              </div>
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed">
                Upgrade to appear higher in search results and unlock analytics.
              </p>
              <button
                id="view-plans-btn"
                onClick={() => setShowPlans(true)}
                className="w-full mt-4 bg-[#1a9e8f] text-white rounded-full py-2.5 text-sm font-medium hover:bg-[#158577] transition"
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
                { to: '/doctor/analytics', label: 'Analytics' },
                { to: '/doctor/settings', label: 'Settings' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="flex items-center justify-between py-2 text-sm text-[#5a7370] hover:text-[#1a9e8f] border-b border-[#f3f4f6] last:border-0 transition-colors">
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

