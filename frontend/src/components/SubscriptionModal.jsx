import React, { useState } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '../contexts/AuthContext';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 99,
    duration: '1 month',
    benefits: ['Appear in search results', 'Up to 30 bookings/month', 'Basic analytics', 'Email support'],
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 250,
    duration: '3 months',
    benefits: ['Everything in Monthly', 'Priority in search results', 'Advanced analytics', 'Priority support'],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 999,
    duration: '12 months',
    benefits: ['Everything in Quarterly', 'Top search placement', 'Full analytics suite', 'Dedicated support', 'Profile badge'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 349,
    duration: '6 months',
    benefits: ['Multi-clinic support', 'Team accounts', 'Custom analytics', 'SLA guarantee', 'Account manager'],
  },
];

export default function SubscriptionModal({ onClose, onSubscribe }) {
  const { setUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null); // plan id being processed
  const [error, setError] = useState('');

  if (!onClose) return null;

  const handleSubscribe = async (plan) => {
    if (!window.Razorpay) {
      setError('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }
    setLoadingPlan(plan.id);
    setError('');
    try {
      // Step 1: Create Razorpay order
      const res = await axios.post(
        `${API_URL}/subscriptions/create-order?plan_name=${plan.id}`,
        {},
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );
      const { order_id, amount } = res.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Docto',
        description: `${plan.name} Subscription — ₹${plan.price}`,
        order_id,
        handler: async (response) => {
          try {
            // Step 3: Confirm payment on backend
            await axios.post(
              `${API_URL}/subscriptions/confirm?plan_name=${plan.id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}&razorpay_order_id=${response.razorpay_order_id}`,
              {},
              { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
            );
            if (setUser) {
              setUser(prev => ({ ...prev, subscription_plan: plan.id }));
            }
            if (onSubscribe) onSubscribe(plan);
            onClose();
          } catch (err) {
            setError('Payment confirmed but activation failed. Please contact support.');
          }
        },
        prefill: {},
        theme: { color: '#1a9e8f' },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to initiate payment. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-10 pt-8 pb-6 border-b border-[#e5e7eb] shrink-0 bg-gradient-to-br from-white to-[#f0faf9]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#0d2b28] tracking-tight">
                Unlock Full Potential
              </h2>
              <p className="text-[#6b7280] mt-2 text-sm leading-relaxed max-w-md">
                Choose a plan to elevate your practice, increase visibility, and access deep performance insights.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-white border border-[#e5e7eb] text-[#9ca3af] hover:text-[#1a9e8f] hover:border-[#1a9e8f] transition-all duration-300 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {error && (
            <div className="mt-5 px-5 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-2xl text-sm text-[#ef4444] animate-pulse">
              {error}
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
          {PLANS.map(plan => {
            const isLoading = loadingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-5 border transition-all ${
                  plan.popular
                    ? 'border-[#1a9e8f] shadow-md'
                    : 'border-[#e5e7eb] hover:border-[#1a9e8f]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full bg-[#1a9e8f] text-white whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                <div className="mb-6">
                  <span className="text-[10px] font-bold text-[#1a9e8f] uppercase tracking-[0.2em] bg-[#1a9e8f]/10 px-2 py-0.5 rounded-md">{plan.duration}</span>
                  <h3 className="text-xl font-bold text-[#0d2b28] mt-3">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-[#0d2b28] tracking-tighter">&#8377;{plan.price}</span>
                    <span className="text-[#9ca3af] text-sm font-medium">/period</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.benefits.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-[#374151]">
                      <svg className="w-4 h-4 text-[#10b981] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  id={`subscribe-${plan.id}-btn`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={!!loadingPlan}
                  className={`w-full rounded-full py-2.5 text-sm font-medium transition flex items-center justify-center gap-2 ${
                    loadingPlan
                      ? isLoading
                        ? 'bg-[#158577] text-white cursor-wait'
                        : 'bg-[#e6f7f5] text-[#9ca3af] cursor-not-allowed'
                      : 'bg-[#1a9e8f] text-white hover:bg-[#158577]'
                  }`}
                >
                  {isLoading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {isLoading ? 'Opening payment…' : `Subscribe for ₹${plan.price}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

