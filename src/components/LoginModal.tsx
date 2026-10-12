import React, { useState } from 'react';
import { Store, User, Hash, MapPin, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { PromoterProfile } from '../types';

interface LoginModalProps {
  onLoginSuccess: (profile: PromoterProfile) => void;
  initialProfile?: PromoterProfile;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
  initialProfile,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [empId, setEmpId] = useState(initialProfile?.empId || '');
  const [storeLocation, setStoreLocation] = useState(initialProfile?.storeLocation || '');
  const [storeCode, setStoreCode] = useState(initialProfile?.storeCode || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!empId.trim()) {
      setError('Please enter your Employee ID');
      return;
    }
    if (!storeLocation.trim()) {
      setError('Please enter your store location');
      return;
    }
    if (!storeCode.trim()) {
      setError('Please enter your store code');
      return;
    }

    const updatedProfile: PromoterProfile = {
      name: name.trim(),
      empId: empId.trim(),
      storeLocation: storeLocation.trim(),
      storeCode: storeCode.trim(),
      phone: initialProfile?.phone || '+91 98765 43210',
      targetMonthlySales: initialProfile?.targetMonthlySales || 500000,
      currentMonthlySales: initialProfile?.currentMonthlySales || 342000,
    };

    onLoginSuccess(updatedProfile);
  };

  const handleQuickFill = () => {
    setName('Prajwal R.M.');
    setEmpId('PRM-8821');
    setStoreLocation('Reliance Digital / Croma, Indiranagar, Bengaluru');
    setStoreCode('CR-IND-504');
    setError('');
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-[90] flex items-center justify-center p-4 bg-black/80 dark:bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-black/15 dark:border-white/20 shadow-2xl relative overflow-hidden text-black dark:text-white transition-colors my-auto max-h-[calc(100vh-5.5rem)]">
        {/* Brand Header */}
        <div className="text-center mb-7 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black border border-black/20 dark:border-white/20 shadow-xl mb-3">
            <span className="font-playfair text-2xl font-bold tracking-[0.2em]">
              SALES
            </span>
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold tracking-tight">
            Promoter Sign In
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-serif">
            Authorized store floor appliance catalog & AI pitch assistant
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 font-playfair">
              Promoter Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Prajwal R.M."
                className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Emp ID */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 font-playfair">
              Employee ID
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={empId}
                onChange={(e) => {
                  setEmpId(e.target.value);
                  setError('');
                }}
                placeholder="e.g. EMP-7842"
                className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none transition uppercase shadow-sm"
              />
            </div>
          </div>

          {/* Store Location */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 font-playfair">
              Store Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={storeLocation}
                onChange={(e) => {
                  setStoreLocation(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Croma, Indiranagar, Bengaluru"
                className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Store Code */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 font-playfair">
              Store Code
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={storeCode}
                onChange={(e) => {
                  setStoreCode(e.target.value);
                  setError('');
                }}
                placeholder="e.g. CR-IND-402"
                className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none transition uppercase shadow-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-black text-white dark:bg-white dark:text-black font-playfair font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-[0.98]"
            >
              <span>Enter Store Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 px-3 text-xs text-neutral-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-center gap-1.5 font-playfair"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Quick Fill Promoter Demo Data
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Device Encrypted · Data Stored Permanently</span>
        </div>
      </div>
    </div>
  );
};
