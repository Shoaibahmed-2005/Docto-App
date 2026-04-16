import React, { useState, useRef, useEffect } from 'react';
import { useAuth, API_URL } from '../../contexts/AuthContext';
import axios from 'axios';

export default function DoctorSettings() {
  const { user, token, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(
    user?.profile_photo ? (user.profile_photo.startsWith('http') ? user.profile_photo : `${API_URL}${user.profile_photo}`) : null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Use state instead of refs for a more controlled experience
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    clinic_name: user?.clinic_name || '',
    clinic_address: user?.clinic_address || '',
    consultation_fee: user?.consultation_fee || 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        clinic_name: user.clinic_name || '',
        clinic_address: user.clinic_address || '',
        consultation_fee: user.consultation_fee || 0,
      });
      if (user.profile_photo) {
          const url = user.profile_photo.startsWith('http') ? user.profile_photo : `${API_URL}${user.profile_photo}`;
          setPhotoPreview(url);
      }
    }
  }, [user]);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post(`${API_URL}/doctors/me/photo`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (setUser) setUser(prev => ({ ...prev, profile_photo: res.data.profile_photo }));
      setMsg({ text: 'Photo updated successfully', type: 'success' });
    } catch (err) {
      setMsg({ text: 'Photo upload failed. Try again.', type: 'error' });
    } finally {
      setUploading(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  const handleSave = async (e) => {
    if(e) e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await axios.put(`${API_URL}/doctors/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (setUser) setUser(res.data.data);
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMsg({ text: 'Failed to save profile. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-[#1a9e8f]/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-[#1a9e8f]/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#0d2b28] tracking-tight">Profile Settings</h1>
            <p className="text-[#9ca3af] mt-2 font-medium">Manage your professional credentials and account details.</p>
          </div>
          {msg.text && (
            <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <div className={`w-2 h-2 rounded-full ${msg.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <span className="text-xs font-bold uppercase tracking-widest">{msg.text}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero Section: Photo + Display Name */}
          <div className="bg-white rounded-[2.5rem] border border-[#e5e7eb] shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1a9e8f]/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div 
                  className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-[#1a9e8f] to-[#0d2b28] p-1 shadow-2xl relative overflow-hidden group/photo cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                  onClick={handlePhotoClick}
                >
                  <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden flex items-center justify-center relative">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" />
                    ) : (
                      <span className="text-4xl font-bold text-[#1a9e8f]">{user.full_name?.charAt(0) || 'D'}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                       <svg className="w-8 h-8 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2 2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       <span className="text-white text-[10px] uppercase font-bold tracking-widest">Update Photo</span>
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[2.5rem] backdrop-blur-[2px]">
                    <div className="w-8 h-8 border-4 border-[#1a9e8f] border-t-transparent rounded-full animate-spin" />
                  </div>
                 )}
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Professional Full Name</label>
                    <input
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl px-6 py-4 text-sm font-bold text-[#0d2b28] focus:ring-2 focus:ring-[#1a9e8f] focus:bg-white transition-all outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Contact Phone</label>
                    <input
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl px-6 py-4 text-sm font-bold text-[#0d2b28] focus:ring-2 focus:ring-[#1a9e8f] focus:bg-white transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-[#9ca3af] font-medium leading-relaxed italic border-l-2 border-[#e5e7eb] pl-4">
                  This information will be displayed to patients during searches and appointment bookings.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white rounded-[2.5rem] border border-[#e5e7eb] shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-10 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Professional Bio / About</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      placeholder="Share your philosophy, education, and years of experience..."
                      rows={6}
                      className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-[2rem] px-6 py-5 text-sm font-medium text-[#0d2b28] lg:leading-relaxed focus:ring-2 focus:ring-[#1a9e8f] focus:bg-white transition-all outline-none resize-none shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Main Practice Name</label>
                       <input
                        value={formData.clinic_name}
                        onChange={e => setFormData({...formData, clinic_name: e.target.value})}
                        className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl px-6 py-4 text-sm font-bold text-[#0d2b28] focus:ring-2 focus:ring-[#1a9e8f] focus:bg-white transition-all outline-none shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Consultation Fee (₹)</label>
                       <div className="relative">
                         <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-[#1a9e8f]">₹</span>
                         <input
                          type="number"
                          value={formData.consultation_fee}
                          onChange={e => setFormData({...formData, consultation_fee: parseInt(e.target.value) || 0})}
                          className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0d2b28] focus:ring-2 focus:ring-[#1a9e8f] focus:bg-white transition-all outline-none shadow-sm"
                        />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] ml-1">Complete Clinic Address</label>
                     <div className="relative">
                        <textarea
                          value={formData.clinic_address}
                          onChange={e => setFormData({...formData, clinic_address: e.target.value})}
                          rows={2}
                          className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl px-6 py-4 text-sm font-medium text-[#0d2b28] focus:ring-2 focus:ring-[#1a9e8f] focus:bg-white transition-all outline-none shadow-sm resize-none"
                        />
                        <div className="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-white border border-[#e5e7eb] flex items-center justify-center text-[#1a9e8f] shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-8">
               <div className="bg-[#0d2b28] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-10 -mr-10 blur-2xl group-hover:bg-white/10 transition-colors" />
                  <h3 className="text-xl font-bold mb-4 tracking-tight">Sync Changes</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-10">Review your professional details carefully. Updates are reflected across the patient platform instantly.</p>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full bg-white text-[#0d2b28] rounded-2xl py-4 text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${saving ? 'opacity-50 cursor-wait' : 'hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5'}`}
                  >
                    {saving ? 'Syncing...' : 'Update Production Profile'}
                  </button>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-[#e5e7eb] shadow-sm p-8 space-y-6">
                  <div className="flex items-center gap-4 border-b border-[#f3f4f6] pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#f8f9fb] flex items-center justify-center text-xl shadow-inner">🔒</div>
                    <div>
                      <p className="font-bold text-[#0d2b28] text-sm">Security & Privacy</p>
                      <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider mt-1">2FA & Recovery</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button type="button" className="w-full text-left py-3 px-5 rounded-xl text-sm font-bold text-[#6b7280] hover:bg-[#f8f9fb] hover:text-[#0d2b28] transition-all flex items-center justify-between group">
                      Change Password
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                    <button type="button" className="w-full text-left py-3 px-5 rounded-xl text-sm font-bold text-[#6b7280] hover:bg-[#f8f9fb] hover:text-[#0d2b28] transition-all flex items-center justify-between group">
                      Manage Sessions
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                    <button type="button" className="w-full text-left py-3 px-5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-between group">
                      Deactivate Account
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">⚠</span>
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
