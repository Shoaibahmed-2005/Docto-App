import React from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../contexts/AuthContext';
import { formatDoctorName } from '../utils/identityUtils';

export default function DoctorCard({ doctor }) {
  const initials = doctor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DR';
  const photoUrl = doctor.profile_photo
    ? (doctor.profile_photo.startsWith('http') ? doctor.profile_photo : `${API_URL}${doctor.profile_photo}`)
    : null;

  return (
    <div className="bg-white rounded-[2rem] border border-[#e5e7eb] shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-8 flex flex-col gap-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
      {/* Premium Background Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#1a9e8f]/5 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-700" />

      {/* Header: Avatar + Name + Specialization */}
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-20 h-20 rounded-3xl overflow-hidden flex-shrink-0 bg-white border border-[#e5e7eb] shadow-sm transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
          {photoUrl ? (
            <img src={photoUrl} alt={doctor.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a9e8f] to-[#0d2b28] text-white text-2xl font-bold">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-[#0d2b28] font-bold text-lg leading-tight truncate group-hover:text-[#1a9e8f] transition-colors">
              {formatDoctorName(doctor.full_name)}
            </h3>
            {doctor.is_verified && (
              <span className="w-5 h-5 rounded-full bg-[#1a9e8f] text-white flex items-center justify-center flex-shrink-0 shadow-sm" title="Verified Provider">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
            )}
          </div>
          <p className="text-[#1a9e8f] text-[10px] font-bold uppercase tracking-[0.2em]">{doctor.specialization}</p>
        </div>
      </div>

      {/* Stats & Details */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#f3f4f6]">
        <div className="space-y-1">
          <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider">Rating</p>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-lg">★</span>
            <span className="text-sm font-bold text-[#0d2b28]">{doctor.avg_rating?.toFixed(1) || '—'}</span>
            <span className="text-[10px] text-[#9ca3af] font-bold">({doctor.total_reviews})</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider">Fee Per Visit</p>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#0d2b28]">₹{doctor.consultation_fee}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Location & Actions */}
      <div className="flex flex-col gap-4">
        {doctor.distance_km !== undefined && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f9fb] rounded-xl border border-[#e5e7eb] w-fit">
             <span className="text-sm">📍</span>
             <span className="text-[11px] font-bold text-[#6b7280]">{doctor.distance_km?.toFixed(1)} km away</span>
             {doctor.clinic_name && <span className="w-1 h-1 rounded-full bg-[#d1d5db]" />}
             {doctor.clinic_name && <span className="text-[11px] font-bold text-[#6b7280] truncate max-w-[100px]">{doctor.clinic_name}</span>}
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to={`/doctor/${doctor.id}`}
            className="flex-1 bg-[#1a9e8f] text-white rounded-2xl py-4 text-xs font-bold uppercase tracking-widest text-center shadow-[0_10px_20px_rgba(26,158,143,0.15)] hover:bg-[#0d2b28] hover:shadow-[0_15px_30px_rgba(13,43,40,0.2)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}

