import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';
import DoctorCard from '../../components/DoctorCard';

import StarRating from '../../components/StarRating';
import { useNavigate, Link } from 'react-router-dom';

const specialties = ["General Physician", "Pediatrician", "Gynecologist", "Surgeon", "Cardiologist", "Dermatologist", "Orthopedic", "Neurologist", "Psychiatrist", "Ophthalmologist", "ENT", "Dentist"];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2rem] border border-[#e5e7eb] p-8 space-y-6 animate-pulse">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-gray-100" />
        <div className="flex-grow space-y-3">
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
          <div className="h-2 w-1/4 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
        <div className="h-4 bg-gray-50 rounded" />
        <div className="h-4 bg-gray-50 rounded" />
      </div>
      <div className="h-14 bg-gray-100 rounded-2xl" />
    </div>
  );
}

export default function Home() {
  const { user, role } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Search parameters
  const [lat, setLat] = useState(13.0827); // Chennai default
  const [lng, setLng] = useState(80.2707);
  const [radius, setRadius] = useState(20);
  const [specialty, setSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [locationStatus, setLocationStatus] = useState('default');
  const [locationLabel, setLocationLabel] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setLocationStatus('set');
        // Reverse geocode to get area name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          // Skip suburb if it looks like a zone/administrative label
          const suburb = addr.suburb && !/zone|ward|division/i.test(addr.suburb) ? addr.suburb : null;
          const area = addr.neighbourhood || addr.quarter || suburb || addr.city_district || addr.town || addr.village || addr.city || '';
          const city = addr.city || addr.state_district || '';
          setLocationLabel(area ? `${area}${city && city !== area ? ', ' + city : ''}` : data.display_name?.split(',')[0] || '');
        } catch { setLocationLabel(''); }
      },
      () => { setLocationStatus('denied'); setLocationLabel(''); },
      { timeout: 8000 }
    );
  };

  useEffect(() => getLocation(), []);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/doctors/search`, {
          params: {
            lat, lng, radius_km: radius,
            ...(specialty && { specialty }),
            ...(searchQuery && { query: searchQuery }),
            ...(sortBy && { sort_by: sortBy }),
            offers_online: isOnline,
            emergency_available: isEmergency
          }
        });
        setDoctors(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => fetchDocs(), 300);
    return () => clearTimeout(timer);
  }, [lat, lng, radius, specialty, searchQuery, sortBy, isOnline, isEmergency]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden bg-[#0d2b28]">
        {/* Dynamic Gradient Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a9e8f]/20 rounded-full blur-[120px] -mr-40 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -ml-40 -mb-20" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">India's Premium Healthcare Finder</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-8">
            Find the right doctor, <span className="text-[#1a9e8f]">right near you</span>
          </h1>
          <p className="text-lg text-[#1a9e8f]/80 max-w-2xl mx-auto leading-relaxed mb-12">
            Seamlessly book appointments with top-rated specialists in your area. Modern healthcare, reimagined for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#doctors" className="w-full sm:w-auto bg-[#1a9e8f] text-white rounded-2xl px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-[#0d2b28] hover:scale-105 transition-all shadow-[0_20px_40px_rgba(26,158,143,0.3)]">
              Find Doctors
            </a>
            {user && role === 'patient' && (
              <Link to="/patient/bookings" className="w-full sm:w-auto bg-white/5 backdrop-blur-xl text-white border border-white/20 rounded-2xl px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#1a9e8f] transition-all flex items-center justify-center gap-3">
                <svg className="w-5 h-5 text-[#1a9e8f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                My Bookings
              </Link>
            )}
            <button onClick={getLocation} className="w-full sm:w-auto bg-white/5 backdrop-blur-xl text-white border border-white/10 rounded-2xl px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              <svg className="w-5 h-5 text-[#1a9e8f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Nearby Clinics
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div id="doctors" className="sticky top-16 z-40 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Specialty */}
            <select
              id="filter-specialty"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="border border-[#e5e7eb] rounded-full px-4 py-2 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] cursor-pointer appearance-none pr-8 relative"
            >
              <option value="">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Sort By */}
            <select
              id="filter-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-[#e5e7eb] rounded-full px-4 py-2 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] cursor-pointer"
            >
              <option value="distance">Nearest first</option>
              <option value="rating">Top rated</option>
              <option value="experience">Most experienced</option>
              <option value="fee">Lowest fee</option>
            </select>

            {/* Hybrid/Emergency Toggles */}
            <div className="flex items-center gap-2 border-l border-[#e5e7eb] pl-3 h-8 my-auto">
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${isOnline
                  ? 'bg-[#e6f7f5] text-[#1a9e8f] border border-[#1a9e8f]'
                  : 'text-[#6b7280] border border-[#e5e7eb] hover:border-[#1a9e8f] hover:text-[#1a9e8f]'
                  }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Consult
              </button>

              <button
                onClick={() => setIsEmergency(!isEmergency)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${isEmergency
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-[#6b7280] border border-[#e5e7eb] hover:border-red-400 hover:text-red-500'
                  }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Emergency
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-grow max-w-sm">
              <input
                type="text"
                placeholder="Search by name or area..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-full px-4 py-2 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a9e8f]"
              />
            </div>

            {/* Use My Location */}
            <button
              id="filter-location-btn"
              onClick={getLocation}
              disabled={locationStatus === 'detecting'}
              className={`rounded-full px-4 py-2 text-sm font-medium transition flex items-center gap-1.5 ml-auto border ${locationStatus === 'set'
                ? 'border-[#10b981] text-[#10b981] bg-[#f0fdf4]'
                : locationStatus === 'denied'
                  ? 'border-[#ef4444] text-[#ef4444] bg-[#fef2f2]'
                  : locationStatus === 'detecting'
                    ? 'border-[#f59e0b] text-[#f59e0b] bg-[#fffbeb]'
                    : 'border-[#e5e7eb] text-[#0d2b28] hover:bg-[#e6f7f5]'
                }`}
            >
              {locationStatus === 'detecting' ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {locationStatus === 'detecting' ? 'Detecting…'
                : locationStatus === 'set' ? `📍 ${locationLabel || 'Location set ✓'}`
                  : locationStatus === 'denied' ? 'Allow location access'
                    : 'My Location'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">


        {/* Section heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#0d2b28]">
            {loading ? 'Finding doctors…' : `${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} nearby`}
          </h2>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#f8f9fb] border border-[#e5e7eb] flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl text-[#0d2b28]">No doctors found</h3>
            <p className="text-[#9ca3af] mt-2 text-sm max-w-xs">
              Try adjusting your filters or expanding your search area.
            </p>
            <button
              id="clear-filters-btn"
              onClick={() => { setSpecialty(''); setSearchQuery(''); setIsOnline(false); setIsEmergency(false); }}
              className="mt-5 border border-[#c8e8e5] text-[#1a9e8f] rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#e6f7f5] transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
