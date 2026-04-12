import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/doctors/me/slots`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
      await axios.post(`${API_URL}/doctors/me/slots`, { date, start_time: startTime, end_time: endTime }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchSlots();
      setDate(''); setStartTime(''); setEndTime('');
    } catch (e) {
      alert("Error adding slot");
    }
  };

  const deleteSlot = async (id) => {
    try {
      await axios.delete(`${API_URL}/doctors/me/slots/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchSlots();
    } catch (e) {
      alert("Cannot delete booked slot");
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
        <h1 className="text-3xl text-[#111827] mb-8" style={{ fontFamily: 'Instrument Serif, serif' }}>
          Manage Availability
        </h1>

        {/* Add Slot Form */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-[#111827] mb-4">Add a Slot</h2>
          <form onSubmit={addSlot} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280] font-medium">Date</label>
              <input
                id="slot-date-input"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280] font-medium">Start Time</label>
              <input
                id="slot-start-input"
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280] font-medium">End Time</label>
              <input
                id="slot-end-input"
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
              />
            </div>
            <button
              id="add-slot-btn"
              type="submit"
              className="bg-[#111827] text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-[#374151] transition"
            >
              Add Slot
            </button>
          </form>
        </div>

        {/* Calendar + Slot Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date List */}
          <div>
            <h2 className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-3">Dates with Slots</h2>
            <div className="space-y-1">
              {dates.length === 0 ? (
                <p className="text-sm text-[#9ca3af] py-4 text-center">No slots added yet.</p>
              ) : dates.map(d => {
                const hasBooked = grouped[d]?.some(s => s.is_booked);
                const freeCount = grouped[d]?.filter(s => !s.is_booked).length || 0;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedDate === d
                        ? 'bg-[#111827] text-white'
                        : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#f8f9fb]'
                    }`}
                  >
                    <span>{formatDate(d)}</span>
                    <div className="flex items-center gap-1.5">
                      {freeCount > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedDate === d ? 'bg-white/20 text-white' : 'bg-[#d1fae5] text-[#065f46]'}`}>
                          {freeCount} free
                        </span>
                      )}
                      {hasBooked && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedDate === d ? 'bg-white/20 text-white' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                          booked
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
                <h2 className="text-lg font-medium text-[#111827] mb-4">{formatDate(selectedDate)}</h2>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map(s => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border ${
                        s.is_booked
                          ? 'bg-[#fef3c7] border-[#fde68a] text-[#92400e]'
                          : 'bg-white border-[#e5e7eb] text-[#374151]'
                      }`}
                    >
                      <span>{formatTime(s.start_time)} – {formatTime(s.end_time)}</span>
                      {s.is_booked ? (
                        <span className="text-[#92400e] font-semibold">•&nbsp;Booked</span>
                      ) : (
                        <button
                          id={`delete-slot-${s.id}`}
                          onClick={() => deleteSlot(s.id)}
                          className="text-[#9ca3af] hover:text-[#ef4444] transition ml-1"
                          title="Delete slot"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
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
