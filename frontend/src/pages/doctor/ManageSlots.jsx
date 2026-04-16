import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/doctors/me/slots`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setSlots(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/doctors/me/slots`, { date, start_time: startTime, end_time: endTime, is_online: isOnline }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchSlots();
      setDate(''); setStartTime(''); setEndTime(''); setIsOnline(false);
    } catch (e) {
      alert(e.response?.data?.detail || "Error adding slot");
    }
  };

  const deleteSlot = async (id) => {
    try {
      await axios.delete(`${API_URL}/doctors/me/slots/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchSlots();
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to delete slot. There might be an active booking.");
    }
  };

  // Group slots by date
  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const daySlots = selectedDate ? (grouped[selectedDate] || []) : [];

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          Manage Availability
        </h1>

        {/* Add Slot Form */}
        <div className="bg-white rounded-[2rem] border border-[#e5e7eb] shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-8 mb-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#1a9e8f]" />
          <h2 className="text-xl font-bold text-[#0d2b28] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#e6f7f5] text-[#1a9e8f] flex items-center justify-center text-lg">﹢</span>
            Create New Availability
          </h2>
          <form onSubmit={addSlot} className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
               <label className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em] ml-1">Consultation Mode</label>
               <div className="flex items-center gap-2 bg-[#f3f4f6] p-1.5 rounded-2xl w-fit border border-[#e5e7eb]">
                <button type="button" onClick={() => setIsOnline(false)} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${!isOnline ? 'bg-white shadow-md text-[#1a9e8f] border border-[#e5e7eb]' : 'text-[#6b7280] hover:text-[#374151]'}`}>
                  🏥 In-Clinic
                </button>
                <button type="button" onClick={() => setIsOnline(true)} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${isOnline ? 'bg-white shadow-md text-[#1a9e8f] border border-[#e5e7eb]' : 'text-[#6b7280] hover:text-[#374151]'}`}>
                  💻 Video Call
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em] ml-1">Select Date</label>
                <input
                  id="slot-date-input"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="border border-[#e5e7eb] rounded-2xl px-5 py-3.5 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white w-full font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em] ml-1">From</label>
                <input
                  id="slot-start-input"
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="border border-[#e5e7eb] rounded-2xl px-5 py-3.5 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white w-full font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em] ml-1">To</label>
                <input
                  id="slot-end-input"
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="border border-[#e5e7eb] rounded-2xl px-5 py-3.5 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white w-full font-medium"
                />
              </div>
              <button
                id="add-slot-btn"
                type="submit"
                className="bg-[#0d2b28] text-white rounded-2xl px-8 py-4 text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
              >
                Publish Slot
              </button>
            </div>
          </form>
        </div>

        {/* Calendar + Slot Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date List */}
          <div>
            <h2 className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em] mb-4 ml-1">Calendar Overview</h2>
            <div className="space-y-2">
              {dates.length === 0 ? (
                <div className="bg-[#f8f9fb] rounded-3xl border border-dashed border-[#e5e7eb] py-12 text-center">
                  <p className="text-sm text-[#9ca3af]">No slots published.</p>
                </div>
              ) : dates.map(d => {
                const hasBooked = grouped[d]?.some(s => s.is_booked);
                const freeCount = grouped[d]?.filter(s => !s.is_booked).length || 0;
                const isActive = selectedDate === d;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`group w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
                      isActive
                        ? 'bg-[#0d2b28] text-white shadow-lg'
                        : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#1a9e8f] hover:bg-[#f0faf9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#1a9e8f]' : 'bg-[#e5e7eb] group-hover:bg-[#1a9e8f]'}`} />
                      <span>{formatDate(d)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {freeCount > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg uppercase tracking-wider ${isActive ? 'bg-white/10 text-white' : 'bg-[#e6f7f5] text-[#1a9e8f]'}`}>
                          {freeCount} Free
                        </span>
                      )}
                      {hasBooked && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg uppercase tracking-wider ${isActive ? 'bg-amber-400 text-[#0d2b28]' : 'bg-amber-50 text-amber-600'}`}>
                          • Booked
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots for Selected Date */}
          <div className="lg:col-span-2">
            {!selectedDate ? (
              <div className="h-full flex items-center justify-center py-16 text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-[#f8f9fb] border border-[#e5e7eb] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[#9ca3af] text-sm">Select a date to view its slots</p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-[#0d2b28] mb-4">{formatDate(selectedDate)}</h2>
                <div className="flex flex-wrap gap-3">
                  {daySlots.map(s => (
                    <div
                      key={s.id}
                      className={`flex flex-col gap-3 px-6 py-5 rounded-[2rem] border min-w-[160px] transition-all duration-300 shadow-sm relative overflow-hidden group ${
                        s.is_booked
                          ? 'bg-amber-50 border-amber-200'
                          : s.is_online
                            ? 'bg-[#f0f7ff] border-[#bee0ff]'
                            : 'bg-white border-[#e5e7eb] hover:border-[#1a9e8f]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-xl font-bold tracking-tight ${s.is_booked ? 'text-amber-800' : s.is_online ? 'text-blue-800' : 'text-[#0d2b28]'}`}>
                          {formatTime(s.start_time)}
                        </span>
                        {!s.is_booked && (
                          <button
                            id={`delete-slot-${s.id}`}
                            onClick={() => deleteSlot(s.id)}
                            className={`p-1.5 rounded-lg transition-colors ${s.is_online ? 'text-blue-300 hover:bg-blue-100 hover:text-blue-600' : 'text-[#d1d5db] hover:bg-red-50 hover:text-red-500'}`}
                            title="Delete slot"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        {s.is_online ? (
                          <span className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 ${s.is_booked ? 'text-amber-700' : 'text-blue-600'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Video Consult
                          </span>
                        ) : (
                          <span className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 ${s.is_booked ? 'text-amber-700' : 'text-[#6b7280]'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1a9e8f]" />
                            In-Clinic
                          </span>
                        )}
                        {s.is_booked && (
                          <span className="text-[10px] bg-amber-400 text-[#0d2b28] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">Booked</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {daySlots.length === 0 && (
                    <p className="text-sm text-[#9ca3af]">No slots for this date.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

