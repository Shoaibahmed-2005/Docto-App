import React, { useState } from 'react';

export default function SlotPicker({ slots, selectedSlot, onSelectSlot }) {
  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
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

  if (slots.length === 0) {
    return (
      <div className="p-5 bg-[#f8f9fb] rounded-2xl border border-[#e5e7eb] text-center">
        <p className="text-[#9ca3af] text-sm">No availability for the next 7 days.</p>
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
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all min-w-[64px] ${
                isActive
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#f8f9fb]'
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
                      ? 'bg-[#111827] text-white shadow-sm'
                      : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#111827] hover:text-white hover:border-[#111827]'}
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
