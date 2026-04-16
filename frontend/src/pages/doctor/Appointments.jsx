import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

const STATUS_STYLES = {
  confirmed: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
  completed: 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]',
  no_show: 'bg-gray-100 text-[#374151] border-gray-200',
};

const TABS = ['Today', 'Upcoming', 'All'];

// ─── Prescription Modal ──────────────────────────────────────────────────────
function PrescriptionModal({ booking, onClose, onSaved }) {
  const [form, setForm] = useState({
    diagnosis: '',
    medicines: '',
    instructions: '',
    follow_up_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Try to load existing prescription
    axios.get(`${API_URL}/prescriptions/doctor/booking/${booking.id}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    }).then(res => {
      const p = res.data;
      setForm({
        diagnosis: p.diagnosis || '',
        medicines: p.medicines || '',
        instructions: p.instructions || '',
        follow_up_date: p.follow_up_date || '',
        notes: p.notes || '',
      });
    }).catch(() => {
      // No existing prescription — start blank
    }).finally(() => setLoading(false));
  }, [booking.id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await axios.post(`${API_URL}/prescriptions`, {
        booking_id: booking.id,
        ...form,
        follow_up_date: form.follow_up_date || null,
      }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save prescription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-8 pb-6 border-b border-[#e5e7eb] bg-gradient-to-br from-white to-[#f0faf9]">
          <div>
            <h2 className="text-2xl font-bold text-[#0d2b28] tracking-tight">Prescription for {booking.patient?.full_name || 'Patient'}</h2>
            <p className="text-sm text-[#9ca3af] mt-1">Provide clinical diagnosis and medication advice.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-[#e5e7eb] text-[#9ca3af] hover:text-[#1a9e8f] hover:border-[#1a9e8f] transition-all duration-300 shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#1a9e8f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
            {/* Rx Indicator */}
            <div className="flex items-center gap-3 bg-[#e6f7f5] text-[#1a9e8f] px-5 py-3 rounded-2xl w-fit border border-[#c8e8e5] shadow-sm">
               <span className="text-xl font-bold italic tracking-tighter">Rx</span>
               <div className="w-px h-4 bg-[#c8e8e5]" />
               <span className="font-bold text-xs uppercase tracking-[0.1em]">Medical Prescription</span>
            </div>

            {/* Form Sections */}
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Diagnosis / Assessment</label>
                <input
                  value={form.diagnosis}
                  onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                  placeholder="e.g. Acute Respiratory Infection..."
                  className="w-full border border-[#e5e7eb] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-[#f9fafb] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Medications & Dosage</label>
                <textarea
                  value={form.medicines}
                  onChange={e => setForm(f => ({ ...f, medicines: e.target.value }))}
                  placeholder={"Tab. Amoxicillin 500mg\n1-0-1 after food for 5 days..."}
                  rows={4}
                  className="w-full border border-[#e5e7eb] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-[#f9fafb] focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Care Instructions</label>
                <textarea
                  value={form.instructions}
                  onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                  placeholder="Additional lifestyle or diet advice..."
                  rows={2}
                  className="w-full border border-[#e5e7eb] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-[#f9fafb] focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Follow-up</label>
                  <input
                    type="date"
                    value={form.follow_up_date}
                    onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))}
                    className="w-full border border-[#e5e7eb] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-[#f9fafb]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Internal Notes</label>
                  <input
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Private mention..."
                    className="w-full border border-[#e5e7eb] rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-[#f9fafb]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-medium animate-shake">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-10 py-8 bg-gray-50/50 border-t border-[#e5e7eb] flex gap-4">
           <button
            onClick={handleSave}
            disabled={saving || loading}
            className={`flex-1 rounded-2xl py-4 text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${saving ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0d2b28] text-white hover:bg-black shadow-[0_10px_20px_rgba(0,0,0,0.1)]'}`}
          >
            {saving ? 'Processing...' : 'Finalize & Send Prescription'}
          </button>
          <button onClick={onClose} className="px-8 py-4 text-sm font-bold text-[#6b7280] hover:text-[#0d2b28] transition-colors">
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('Today');
  const [prescriptionModal, setPrescriptionModal] = useState(null); // booking obj

  const fetchAppts = async () => {
    try {
      const res = await axios.get(`${API_URL}/doctors/me/appointments`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setAppointments(res.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAppts(); }, []);

  const markComplete = async (id) => {
    try {
      await axios.patch(`${API_URL}/doctors/me/appointments/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchAppts();
    } catch (e) { alert("Error updating status"); }
  };

  const applyDelay = async (id, mins) => {
    let min = mins;
    if (!min) {
      const minStr = window.prompt("Enter delay (in minutes, max 30). The patient gets 10% off for waiting:");
      if (!minStr) return;
      min = parseInt(minStr, 10);
    }
    if (isNaN(min) || min <= 0 || min > 30) {
      alert("Invalid delay amount. Must be between 1 and 30.");
      return;
    }
    try {
      await axios.patch(`${API_URL}/doctors/me/appointments/${id}/delay?delay_minutes=${min}`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchAppts();
    } catch (e) { alert(e.response?.data?.detail || "Error applying delay"); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const filterAppts = (tab) => {
    const today = new Date().toISOString().split('T')[0];
    if (tab === 'Today') return appointments.filter(a => a.slot?.date === today);
    if (tab === 'Upcoming') return appointments.filter(a => a.slot?.date >= today && a.booking.status === 'confirmed');
    return appointments;
  };

  const filtered = filterAppts(activeTab);

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl text-[#0d2b28] mb-8">Appointments</h1>

        {/* Tab Strip */}
        <div className="flex gap-2 bg-[#f3f4f6] rounded-2xl p-1.5 w-fit mb-10 border border-[#e5e7eb] shadow-inner">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`appts-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-[#0d2b28] text-white shadow-[0_4px_12px_rgba(13,43,40,0.2)]' 
                  : 'text-[#9ca3af] hover:text-[#0d2b28] hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {['Patient', 'Date & Time', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-[#9ca3af]">No appointments in this category.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.booking.id} className={`group hover:bg-[#f0faf9] transition-all duration-300 ${a.collision?.collides_with_emergency && !a.booking.is_emergency ? 'bg-[#fffbeb]/50' : ''}`}>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-[#e5e7eb] shadow-sm flex items-center justify-center text-sm font-bold text-[#1a9e8f] group-hover:scale-110 transition-transform">
                        {a.patient?.full_name?.charAt(0) || 'P'}
                      </div>
                      <span className="text-sm font-bold text-[#0d2b28]">{a.patient?.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#0d2b28]">{formatDate(a.slot?.date)}</p>
                    <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider mt-0.5">{formatTime(a.slot?.start_time)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                       <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest ${STATUS_STYLES[a.booking.status] || STATUS_STYLES.confirmed}`}>
                        {a.booking.status}
                      </span>
                      {a.booking.is_emergency && <span className="text-[10px] font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] px-3 py-1 rounded-lg uppercase tracking-widest animate-pulse">Emergency</span>}
                      {a.booking.delay_minutes > 0 && <span className="text-[10px] font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-3 py-1 rounded-lg uppercase tracking-widest">Delayed {a.booking.delay_minutes}m</span>}
                      {a.slot?.is_online && <span className="text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe] px-3 py-1 rounded-lg uppercase tracking-widest">Online</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(a.booking.status === 'confirmed' || a.booking.status === 'completed') && (
                      <div className="flex flex-wrap gap-2 items-center">
                        {a.slot?.is_online && a.booking.status === 'confirmed' && (
                          <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="text-white bg-[#2563eb] border border-[#1e40af] hover:bg-[#1d4ed8] px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Join
                          </a>
                        )}
                        {a.booking.status === 'confirmed' && (
                          <button
                            id={`complete-appt-${a.booking.id}`}
                            onClick={() => markComplete(a.booking.id)}
                            className="bg-[#1a9e8f] text-white rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#158577] transition"
                          >
                            Mark Complete
                          </button>
                        )}
                        {/* Prescription button */}
                        <button
                          id={`prescribe-${a.booking.id}`}
                          onClick={() => setPrescriptionModal(a.booking)}
                          className="border border-[#c8e8e5] text-[#1a9e8f] bg-[#f0fdf9] rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[#e6f7f5] transition flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Rx
                        </button>
                        {/* Delay / Collision */}
                        {a.booking.status === 'confirmed' && !a.booking.is_emergency && !a.booking.delay_minutes && (
                          <div className="flex items-center gap-2">
                            {a.collision?.collides_with_emergency ? (
                              <div className="flex items-center gap-1 bg-[#fff7ed] border border-[#ffedd5] rounded-full p-1 shadow-sm">
                                <span className="text-[10px] font-bold text-[#c2410c] px-2 flex items-center gap-1 animate-pulse">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                  Request Wait
                                </span>
                                <div className="flex gap-1">
                                  {[10, 20, 30].map(m => (
                                    <button key={m} onClick={() => applyDelay(a.booking.id, m)}
                                      className="bg-white text-[#c2410c] border border-[#fed7aa] hover:bg-[#ffedd5] rounded-full px-2.5 py-1 text-[10px] font-bold transition">
                                      {m}m
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => applyDelay(a.booking.id)} className="border border-[#e5e7eb] text-[#374151] bg-[#f9fafb] rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[#f3f4f6]">
                                Set Delay
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Stack */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center"><p className="text-sm text-[#9ca3af]">No appointments in this category.</p></div>
          ) : filtered.map(a => (
            <div key={a.booking.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${a.collision?.collides_with_emergency && !a.booking.is_emergency ? 'border-[#fed7aa]' : 'border-[#e5e7eb]'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[#0d2b28] text-sm">{a.patient?.full_name}</p>
                  <p className="text-xs text-[#9ca3af] mt-1">{formatDate(a.slot?.date)} · {formatTime(a.slot?.start_time)}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block mb-1 text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[a.booking.status] || STATUS_STYLES.confirmed}`}>
                    {a.booking.status}
                  </span>
                  {a.booking.is_emergency && <span className="ml-2 inline-block text-[10px] font-bold bg-[#fee2e2] text-[#991b1b] px-2 py-0.5 rounded uppercase">Emergency</span>}
                  {a.booking.delay_minutes > 0 && <span className="ml-2 inline-block text-[10px] font-bold bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded uppercase">Delayed {a.booking.delay_minutes}m</span>}
                  {a.slot?.is_online && <span className="ml-2 inline-block text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] px-2 py-0.5 rounded uppercase">Online</span>}
                </div>
              </div>
              {(a.booking.status === 'confirmed' || a.booking.status === 'completed') && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.slot?.is_online && a.booking.status === 'confirmed' && (
                    <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="flex-1 justify-center flex items-center gap-1.5 text-white bg-[#2563eb] rounded-full py-2 text-xs font-medium hover:bg-[#1d4ed8] transition shadow-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Join Call
                    </a>
                  )}
                  {a.booking.status === 'confirmed' && (
                    <button onClick={() => markComplete(a.booking.id)} className="flex-1 bg-[#1a9e8f] text-white rounded-full py-2 text-xs font-medium hover:bg-[#158577] transition">
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => setPrescriptionModal(a.booking)}
                    className="flex-1 border border-[#c8e8e5] text-[#1a9e8f] bg-[#f0fdf9] rounded-full py-2 text-xs font-medium hover:bg-[#e6f7f5] transition flex items-center justify-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Write Rx
                  </button>
                  {a.booking.status === 'confirmed' && !a.booking.is_emergency && !a.booking.delay_minutes && (
                    <div className="w-full">
                      {a.collision?.collides_with_emergency ? (
                        <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-3">
                          <p className="text-[11px] font-bold text-[#c2410c] flex items-center gap-1 mb-2">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            Emergency Collision: Request wait time
                          </p>
                          <div className="flex gap-2">
                            {[10, 20, 30].map(m => (
                              <button key={m} onClick={() => applyDelay(a.booking.id, m)} className="flex-1 bg-white text-[#c2410c] border border-[#fed7aa] rounded-full py-2 text-xs font-bold">{m}m</button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => applyDelay(a.booking.id)} className="w-full border border-[#e5e7eb] text-[#374151] bg-[#f9fafb] rounded-full py-2 text-xs font-medium hover:bg-[#f3f4f6]">
                          Set Delay
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prescription Modal */}
      {prescriptionModal && (
        <PrescriptionModal
          booking={prescriptionModal}
          onClose={() => setPrescriptionModal(null)}
          onSaved={fetchAppts}
        />
      )}
    </div>
  );
}
