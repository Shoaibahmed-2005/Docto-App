import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Earnings() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isFree = !user?.subscription_plan || user?.subscription_plan === 'free';

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(`${API_URL}/doctors/me/earnings`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        setData(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#1a9e8f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const summaryCards = [
    { label: 'Total Earned', value: `₹${data.total_earned || 0}`, icon: '💰', color: 'border-[#10b981]' },
    { label: 'Platform Commission', value: `₹${data.platform_commission || 0}`, icon: '🏢', color: 'border-[#f59e0b]' },
    { label: 'Net Payout', value: `₹${data.net_earnings || 0}`, icon: '💳', color: 'border-[#1a9e8f]' },
    { label: 'Pending Payouts', value: `₹${data.pending_payouts || 0}`, icon: '⏳', color: 'border-[#9ca3af]' },
  ];

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          Earnings
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {summaryCards.map((c, i) => (
            <div key={i} className={`bg-white rounded-[2rem] border-l-[6px] ${c.color} border border-[#e5e7eb] shadow-[0_2px_15px_rgba(0,0,0,0.02)] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
              <div className="text-3xl mb-4 grayscale-[0.5] group-hover:grayscale-0 transition-all">{c.icon}</div>
              <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.15em] mb-1">{c.label}</p>
              <p className="text-3xl font-bold text-[#0d2b28] tracking-tight">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="relative bg-white rounded-3xl border border-[#e5e7eb] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8 overflow-hidden mb-12">
          <div className={`flex items-center justify-between mb-8 ${isFree ? 'filter blur-[6px] pointer-events-none' : ''}`}>
            <div>
              <h2 className="text-2xl font-bold text-[#0d2b28]">Monthly Trend</h2>
              <p className="text-sm text-[#9ca3af] mt-1">Snapshot of your net earnings over time.</p>
            </div>
            <Link to="/doctor/analytics" className="bg-[#e6f7f5] text-[#1a9e8f] text-sm font-bold px-5 py-2.5 rounded-2xl border border-[#c8e8e5] hover:bg-[#1a9e8f] hover:text-white transition-all">
              Full Analytics Report &rarr;
            </Link>
          </div>

          <div className={`flex items-end gap-4 h-48 px-4 mb-3 ${isFree ? 'filter blur-[6px] pointer-events-none' : ''}`}>
            {[35, 55, 45, 70, 60, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-[#1a9e8f]/80 to-[#1a9e8f] rounded-2xl transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer shadow-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className={`flex gap-4 px-4 border-t border-[#f3f4f6] pt-4 ${isFree ? 'filter blur-[6px] pointer-events-none' : ''}`}>
             {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
               <div key={m} className="flex-1 text-center text-[10px] text-[#9ca3af] font-bold tracking-widest uppercase">{m}</div>
             ))}
          </div>

          {/* Upgrade Overlay for Free Users */}
          {isFree && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md">
              <div className="text-center p-10 bg-white border border-[#e5e7eb] rounded-[2.5rem] shadow-2xl max-w-sm mx-4 transform transition-all">
                 <div className="w-16 h-16 bg-[#e6f7f5] rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <svg className="w-8 h-8 text-[#1a9e8f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                <h3 className="text-xl font-bold text-[#0d2b28] mb-3">
                  Premium Insights
                </h3>
                <p className="text-sm text-[#6b7280] mb-8 leading-relaxed font-medium">Unlock detailed monthly trends and growth predictions with a Pro subscription.</p>
                <Link
                  to="/doctor/dashboard"
                  className="w-full bg-[#1a9e8f] text-white rounded-2xl py-4 text-sm font-bold hover:bg-[#158577] transition shadow-[0_10px_20px_rgba(26,158,143,0.2)] active:scale-95 inline-block"
                >
                  Explore Upgrade Plans
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Settlements Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0d2b28]">Recent Settlements</h2>
            <button className="text-sm font-bold text-[#1a9e8f] hover:underline">Download PDF</button>
          </div>
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
             {[
               { date: '12 Apr 2026', ref: 'SET-99201', amount: '₹12,450', status: 'Processing' },
               { date: '05 Apr 2026', ref: 'SET-99188', amount: '₹8,920', status: 'Paid' },
               { date: '28 Mar 2026', ref: 'SET-99154', amount: '₹15,200', status: 'Paid' },
             ].map((s, i) => (
               <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[#f3f4f6] last:border-0 hover:bg-[#f8f9fb] transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-[#0d2b28] text-sm">{s.ref}</p>
                      <p className="text-xs text-[#9ca3af] font-medium mt-0.5">{s.date}</p>
                    </div>
                 </div>
                 <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-6">
                    <p className="font-bold text-[#0d2b28]">{s.amount}</p>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${s.status === 'Paid' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fffbeb] text-[#b45309]'}`}>
                      {s.status}
                    </span>
                 </div>
               </div>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
}


