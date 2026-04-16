import React, { useState } from 'react';

export default function SlotPicker({ slots, selectedSlot, onSelectSlot }) {
  const [viewMode, setViewMode] = useState('clinic');
  const filteredSlots = slots.filter(s => viewMode === 'online' ? s.is_online : !s.is_online);

  // Group slots by date
  const grouped = filteredSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort().slice(0, 7);
  const [activeDate, setActiveDate] = useState(dates[0] || null);

  React.useEffect(() => {
    if (dates.length > 0 && !dates.includes(activeDate)) {
      setActiveDate(dates[0]);
    }
  }, [dates.join(',')]);

  const viewModeToggle = (
    <div className="flex p-1 bg-[#f8f9fb] rounded-xl border border-[#e5e7eb] max-w-sm mb-5">
      <button
        onClick={() => { setViewMode('clinic'); onSelectSlot(null); }}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'clinic' ? 'bg-white shadow-sm text-[#0d2b28]' : 'text-[#6b7280] hover:text-[#374151]'}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        Clinic Visit
      </button>
      <button
        onClick={() => { setViewMode('online'); onSelectSlot(null); }}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'online' ? 'bg-white shadow-sm text-[#0d2b28]' : 'text-[#6b7280] hover:text-[#374151]'}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        Online Video
      </button>
    </div>
  );

  if (filteredSlots.length === 0) {
    return (
      <div>
        {viewModeToggle}
        <div className="p-5 bg-[#f8f9fb] rounded-2xl border border-[#e5e7eb] text-center mt-2">
          <p className="text-[#9ca3af] text-sm">No {viewMode === 'online' ? 'online video' : 'clinic visit'} availability for the next 7 days.</p>
        </div>
      </div>
    );
  }

  const formatDay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      {viewModeToggle}

      {/* 7-day date strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {dates.map(date => {
          const { day, date: d, month } = formatDay(date);
          const isActive = activeDate === date;
          const hasSlots = grouped[date]?.some(s => !s.is_booked);
          return (
            <button
              key={date}
              onClick={() => setActiveDate(date)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all min-w-[64px] ${isActive
                  ? 'bg-[#1a9e8f] text-white shadow-sm'
                  : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#e6f7f5]'
                } ${!hasSlots ? 'opacity-50' : ''}`}
            >
              <span className="text-xs opacity-75">{day}</span>
              <span className="font-semibold text-base leading-tight">{d}</span>
              <span className="text-xs opacity-75">{month}</span>
            </button>
          );
        })}
      </div>

      {/* Time slots for selected date */}
      {activeDate && grouped[activeDate] && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {grouped[activeDate].map(slot => {
            const isSelected = selectedSlot?.id === slot.id;
            return (
              <button
                key={slot.id}
                disabled={slot.is_booked}
                onClick={() => onSelectSlot(slot)}
                className={`
                  px-3 py-2 text-xs font-medium rounded-full transition-all text-center
                  ${slot.is_booked
                    ? 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed line-through'
                    : isSelected
                      ? 'bg-[#1a9e8f] text-white shadow-sm'
                      : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#1a9e8f] hover:text-white hover:border-[#1a9e8f]'}
                `}
              >
                {formatTime(slot.start_time)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
