import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  LogIn, 
  Plus, 
  X, 
  Sparkles, 
  Check, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { COMMON_ALLERGENS } from '../../types';

interface ProfileScreenProps {
  user: FirebaseUser | null;
  login: () => Promise<void>;
  allergies: string[];
  newAllergy: string;
  setNewAllergy: (val: string) => void;
  addAllergy: (e?: React.FormEvent) => void;
  removeAllergy: (allergy: string) => void;
  toggleCommonAllergen: (commonName: string) => void;
  dietaryPreference: string;
  setDietaryPreference: (val: string) => void;
  guestName: string;
  setGuestName: (val: string) => void;
  emergencyPhone: string;
  setEmergencyPhone: (val: string) => void;
  customChefNote: string;
  setCustomChefNote: (val: string) => void;
  setActiveScreen: (screen: 'profile' | 'scan' | 'history' | 'settings' | 'chef-card') => void;
}

export function ProfileScreen({
  user,
  login,
  allergies,
  newAllergy,
  setNewAllergy,
  addAllergy,
  removeAllergy,
  toggleCommonAllergen,
  dietaryPreference,
  setDietaryPreference,
  guestName,
  setGuestName,
  emergencyPhone,
  setEmergencyPhone,
  customChefNote,
  setCustomChefNote,
  setActiveScreen
}: ProfileScreenProps) {
  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease] text-left">
      <div>
        <span className="bg-[#fe9a00]/10 text-[#fe9a00] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#fe9a00]/20">
          Personal Dining Profile
        </span>
        <h2 className="text-3xl font-black text-slate-100 tracking-tight mt-1.5 flex items-center gap-2 font-sans font-extrabold">
          <AlertCircle className="w-8 h-8 text-[#fe9a00] shrink-0" />
          Allergen & Diet Diagnostics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Establish real-time physical food allergy parameters and active diet plans verified by the AI logical reasoning system.
        </p>
      </div>

      {!user && (
        <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl text-center max-w-xl shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-1">Secure Account Sync Option</h3>
          <p className="text-[11px] text-slate-450 mb-4 leading-normal">
            Connect with your secure Google credentials to synchronize your active dietary safeguards and warning passes across multiple dynamic device windows.
          </p>
          <button 
            onClick={login}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Link Personal Bio Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Allergy Management card */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-[#151B26] p-6 rounded-2xl border border-slate-800/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Your Active Biological Allergies
              </h3>
              <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {allergies.length} Selected
              </span>
            </div>

            <form onSubmit={addAllergy} className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add custom allergy (e.g. Pecans, MSG)"
                className="flex-1 px-4 py-2.5 bg-[#1d2433] border border-slate-800/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-slate-100"
              />
              <button
                type="submit"
                className="p-3 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-600 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                title="Add Custom Allergy Tag"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 min-h-[50px] items-center p-3 bg-[#1d2433]/50 rounded-xl border border-dashed border-slate-800">
              <AnimatePresence>
                {allergies.map((allergy) => (
                  <motion.span
                    key={allergy}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold"
                  >
                    {allergy}
                    <button onClick={() => removeAllergy(allergy)} className="hover:bg-rose-500/20 p-0.5 rounded-full cursor-pointer transition-colors">
                      <X className="w-3 h-3 text-rose-450" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              {allergies.length === 0 && (
                <p className="text-xs text-slate-500 italic mx-auto text-center py-2">No active allergy constraints active. Enter tags above.</p>
              )}
            </div>

            <div className="border-t border-slate-800/80 pt-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Quick Preset Common Allergic Hazards
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_ALLERGENS.map((allergen) => {
                  const isActive = allergies.includes(allergen.id);
                  return (
                    <button
                      key={allergen.id}
                      type="button"
                      onClick={() => toggleCommonAllergen(allergen.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all border cursor-pointer",
                        isActive 
                          ? "bg-amber-500/10 text-amber-300 font-bold border-amber-500/40" 
                          : "bg-[#1d2433] text-slate-400 border-slate-850 hover:bg-[#232b3d] border-slate-800"
                      )}
                    >
                      <span className="text-sm shrink-0">{allergen.icon}</span>
                      <span className="truncate flex-1 font-semibold">{allergen.name}</span>
                      {isActive && <Check className="w-3 h-3 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dietary Filter Overlay & Diner Identity Info */}
        <div className="md:col-span-6 space-y-6">
          {/* Dietary Restriction Programs Card */}
          <div className="bg-[#151B26] p-6 rounded-2xl border border-slate-800/80 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              🌱 Lifestyle Food Programs
            </h3>
            <p className="text-[11px] text-slate-550 leading-normal text-slate-400">
              Check specific lifestyle diet overlays below to let the AI automatically screen non-compliant ingredient recipes.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', name: 'None Overlay', desc: 'No diet filters' },
                { id: 'vegan', name: 'Vegan Diet', desc: 'Plant-only inputs' },
                { id: 'vegetarian', name: 'Vegetarian', desc: 'No animal meat/fish' },
                { id: 'pescatarian', name: 'Pescatarian', desc: 'Vegetable & fish' }
              ].map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    setDietaryPreference(plan.id);
                    try {
                      localStorage.setItem('allergy_dietary_preference', plan.id);
                    } catch (e) { console.error(e); }
                  }}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer h-16 flex flex-col justify-center",
                    dietaryPreference === plan.id 
                      ? "bg-amber-500/15 border-amber-500/30 font-bold text-amber-300" 
                      : "border-slate-800 bg-[#1d2433] hover:bg-[#232b3d] text-slate-400"
                  )}
                >
                  <span className="text-xs font-bold block text-slate-200">{plan.name}</span>
                  <span className="text-[9px] text-slate-500 leading-none mt-1">{plan.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Patient coordinates */}
          <div className="bg-[#151B26] p-6 rounded-2xl border border-slate-800/80 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              🚨 Diner Identification Card parameters
            </h3>
            <p className="text-[11px] text-slate-550 leading-normal text-slate-400">
              These warning parameters compile instantly into your printable attention tickets to avoid verbal kitchen mistakes.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Your Full Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    try {
                      localStorage.setItem('allergy_guest_name', e.target.value);
                    } catch (err) { console.error(err); }
                  }}
                  placeholder="e.g. Liam Smith"
                  className="w-full px-3 py-2 bg-[#1d2433] border border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Emergency Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => {
                    setEmergencyPhone(e.target.value);
                    try {
                      localStorage.setItem('allergy_emergency_phone', e.target.value);
                    } catch (err) { console.error(err); }
                  }}
                  placeholder="e.g. +1 555-0911"
                  className="w-full px-3 py-2 bg-[#1d2433] border border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Kitchen / Chef Notes</label>
              <textarea
                value={customChefNote}
                onChange={(e) => {
                  setCustomChefNote(e.target.value);
                  try {
                    localStorage.setItem('allergy_custom_chef_note', e.target.value);
                  } catch (err) { console.error(err); }
                }}
                placeholder="e.g. Extreme sensitivity! Please sanitize kitchenware thoroughly."
                className="w-full h-16 p-3 bg-[#1d2433] border border-slate-800 rounded-xl text-xs focus:outline-none resize-none focus:ring-1 focus:ring-amber-500 text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveScreen('scan')}
              className="flex items-center gap-1.5 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              Proceed to Menu Scanner <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
