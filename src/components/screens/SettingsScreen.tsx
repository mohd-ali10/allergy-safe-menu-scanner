import React from 'react';
import { Sliders } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SavedScan } from '../../types';

interface SettingsScreenProps {
  // Personal Emergency Details
  guestName: string;
  setGuestName: (val: string) => void;
  emergencyPhone: string;
  setEmergencyPhone: (val: string) => void;
  customChefNote: string;
  setCustomChefNote: (val: string) => void;

  // Diet preference
  dietaryPreference: string;
  setDietaryPreference: (val: string) => void;

  // Strictness
  strictness: string;
  setStrictness: (val: string) => void;

  // Output Language
  outputLanguage: string;
  setOutputLanguage: (val: string) => void;

  // AI Model selected
  modelSelected: string;
  setModelSelected: (val: string) => void;

  // Global app data backing
  allergies: string[];
  scansHistory: SavedScan[];
}

export function SettingsScreen({
  guestName,
  setGuestName,
  emergencyPhone,
  setEmergencyPhone,
  customChefNote,
  setCustomChefNote,
  dietaryPreference,
  setDietaryPreference,
  strictness,
  setStrictness,
  outputLanguage,
  setOutputLanguage,
  modelSelected,
  setModelSelected,
  allergies,
  scansHistory
}: SettingsScreenProps) {
  return (
    <div className="max-w-3xl mx-auto bg-[#151B26] border border-slate-800/80 p-8 rounded-3xl shadow-sm space-y-8 text-left animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-amber-500" />
          Safety & Customization Preferences
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize dietary models, AI processing strictness levels, multi-language outputs, and emergency profile tags.
        </p>
      </div>

      <div className="space-y-6">
        {/* Emergency Profile form */}
        <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            🚨 Chef Card Emergency Details
          </h3>
          <p className="text-[11px] text-slate-400 leading-normal">
            These personal coordinates will be automatically format-printed inside your printable allergy warning pass card.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Your Full Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  try {
                    localStorage.setItem('allergy_guest_name', e.target.value);
                  } catch (err) { console.error(err); }
                }}
                placeholder="e.g. Alexander Smith"
                className="w-full px-4 py-2 bg-[#1d2433] border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Emergency Contact Phone</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => {
                  setEmergencyPhone(e.target.value);
                  try {
                    localStorage.setItem('allergy_emergency_phone', e.target.value);
                  } catch (err) { console.error(err); }
                }}
                placeholder="e.g. +1 555-0199"
                className="w-full px-4 py-2 bg-[#1d2433] border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-100"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider block">Custom Instructions to Chef</label>
            <textarea
              value={customChefNote}
              onChange={(e) => {
                setCustomChefNote(e.target.value);
                try {
                  localStorage.setItem('allergy_custom_chef_note', e.target.value);
                } catch (err) { console.error(err); }
              }}
              placeholder="e.g. Severe risk of cross-contamination! Even small vapors trigger allergy asthma."
              className="w-full h-16 px-4 py-2 bg-[#1d2433] border border-slate-800 rounded-xl text-xs focus:outline-none resize-none focus:ring-2 focus:ring-amber-500/20 text-slate-100"
            />
          </div>
        </div>

        {/* Dietary plan selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            🌱 Diet Preferences Filter
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'none', name: 'None (Default)', desc: 'Only specified allergens' },
              { id: 'vegan', name: 'Vegan Program', desc: 'Excludes all animal-sourced food' },
              { id: 'vegetarian', name: 'Vegetarian Program', desc: 'No meat, seafood, or poultry' },
              { id: 'pescatarian', name: 'Pescatarian Program', desc: 'No meat except seafood' }
            ].map(plan => (
              <button
                key={plan.id}
                onClick={() => {
                  setDietaryPreference(plan.id);
                  try {
                    localStorage.setItem('allergy_dietary_preference', plan.id);
                  } catch (e) { console.error(e); }
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer",
                  dietaryPreference === plan.id 
                    ? "bg-amber-500/15 border-amber-500/30 font-bold text-amber-350" 
                    : "border-slate-800 bg-[#1d2433] hover:bg-[#232b3d]"
                )}
              >
                <div className={cn("text-xs font-bold", dietaryPreference === plan.id ? "text-amber-300" : "text-slate-200")}>{plan.name}</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{plan.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Strictness Level */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            🛡️ AI Scanner Strictness
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', name: 'Standard Check', desc: 'General security' },
              { id: 'extreme', name: 'Extreme Vigilance', desc: 'Warn trace risks' },
              { id: 'flexible', name: 'Flexible', desc: 'Direct raw content' }
            ].map(lvl => (
              <button
                key={lvl.id}
                onClick={() => {
                  setStrictness(lvl.id);
                  try {
                    localStorage.setItem('allergy_strictness', lvl.id);
                  } catch (e) { console.error(e); }
                }}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all flex flex-col justify-between h-14 cursor-pointer",
                  strictness === lvl.id 
                    ? "bg-amber-500/15 border-amber-500/30 font-bold text-amber-300" 
                    : "border-slate-800 bg-[#1d2433] hover:bg-[#232b3d]"
                )}
              >
                <div className={cn("text-xs font-bold", strictness === lvl.id ? "text-amber-300" : "text-slate-200")}>{lvl.name}</div>
                <span className="text-[9px] text-slate-500 mt-0.5">{lvl.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language selection */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            🌐 Target Menu Output Language
          </label>
          <select
            value={outputLanguage}
            onChange={(e) => {
              setOutputLanguage(e.target.value);
              try {
                localStorage.setItem('allergy_output_language', e.target.value);
              } catch (err) { console.error(err); }
            }}
            className="w-full text-xs px-3 py-2.5 bg-[#1d2433] border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-200"
          >
            <option value="English">English (United States)</option>
            <option value="Spanish">Spanish (Español)</option>
            <option value="French">French (Français)</option>
            <option value="German">German (Deutsch)</option>
            <option value="Japanese">Japanese (日本語)</option>
            <option value="Chinese">Chinese (中文)</option>
            <option value="Italian">Italian (Italiano)</option>
          </select>
        </div>

        {/* AI Model brain */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            🧠 Gemini Model Brain
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Rapid meal scan processing' },
              { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Advanced logical recipe deduction' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setModelSelected(m.id);
                  try {
                    localStorage.setItem('allergy_model_selected', m.id);
                  } catch (e) { console.error(e); }
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer",
                  modelSelected === m.id 
                    ? "bg-amber-500/15 border-amber-500/30 font-bold" 
                    : "border-slate-800 bg-[#1d2433] hover:bg-[#232b3d]"
                )}
              >
                <div className={cn("text-xs font-bold", modelSelected === m.id ? "text-amber-300" : "text-slate-200")}>{m.name}</div>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-tight">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Maintenance Reset buttons */}
        <div className="border-t border-slate-800 pt-6 flex flex-wrap gap-3 justify-between items-center p-4 bg-[#1d2433]/50 rounded-2xl">
          <button
            onClick={() => {
              const backupData = {
                allergies,
                dietaryPreference,
                strictness,
                outputLanguage,
                modelSelected,
                scansHistory,
                guestName,
                emergencyPhone,
                customChefNote
              };
              const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `allergy-safe-profile-backup.json`;
              link.click();
            }}
            className="px-4 py-2 bg-[#1C2333]/90 text-slate-300 border border-slate-800 hover:bg-[#232b3d]/90 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Export Local Backup
          </button>
          <button
            onClick={() => {
              if (window.confirm("RESET ALL APP DATA: Are you absolutely sure? This will delete your profile settings, emergency coordinates, and history scan events forever.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Reset All Local Data
          </button>
        </div>

      </div>
    </div>
  );
}
