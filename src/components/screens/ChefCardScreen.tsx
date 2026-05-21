import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ChefCardScreenProps {
  guestName: string;
  setGuestName: (val: string) => void;
  emergencyPhone: string;
  setEmergencyPhone: (val: string) => void;
  customChefNote: string;
  setCustomChefNote: (val: string) => void;
  allergies: string[];
}

export function ChefCardScreen({
  guestName,
  setGuestName,
  emergencyPhone,
  setEmergencyPhone,
  customChefNote,
  setCustomChefNote,
  allergies
}: ChefCardScreenProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto text-left animate-[fadeIn_0.3s_ease]">
      {/* Left Options Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#151B26] p-5 rounded-2xl border border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-100">Customize Warning Ticket</h3>
          <p className="text-xs text-slate-400 leading-normal">
            Customize allergy parameters printed directly inside your physical server safety pass.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-bold text-slate-400 uppercase tracking-widest block">Guest Diner Name</label>
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
                className="w-full text-xs px-3 py-2 bg-[#1d2433] border border-slate-800 text-slate-100 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-bold text-slate-400 uppercase tracking-widest block">Diner Emergency Tele</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => {
                  setEmergencyPhone(e.target.value);
                  try {
                    localStorage.setItem('allergy_emergency_phone', e.target.value);
                  } catch (err) { console.error(err); }
                }}
                placeholder="e.g. +1 555-0922"
                className="w-full text-xs px-3 py-2 bg-[#1d2433] border border-slate-800 text-slate-100 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-bold text-slate-400 uppercase tracking-widest block pb-1">Custom Chef Instructions</label>
              <textarea
                value={customChefNote}
                onChange={(e) => {
                  setCustomChefNote(e.target.value);
                  try {
                    localStorage.setItem('allergy_custom_chef_note', e.target.value);
                  } catch (err) { console.error(err); }
                }}
                placeholder="e.g. Severe risk of cross-contamination!"
                className="w-full h-16 text-xs px-3 py-2 bg-[#1d2433] border border-slate-800 text-slate-100 rounded-xl resize-none focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
            <button
              onClick={() => {
                const textToCopy = `SEVERE ALLERGY NOTICE\n\nGuest Name: ${guestName || 'Not specified'}\nAllergies: ${allergies.join(', ').toUpperCase()}\nEmergency Contact: ${emergencyPhone || 'Not specified'}\nNote: ${customChefNote || 'None'}\n\nGenerated with AllergySafe`;
                navigator.clipboard.writeText(textToCopy);
              }}
              className="w-full py-2 bg-[#1C2333]/90 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold hover:bg-[#232b3d] text-center cursor-pointer transition-all border-0"
            >
              Copy SMS Script Option
            </button>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 text-center shadow cursor-pointer transition-all border-0"
            >
              Print Warning Pass Now
            </button>
          </div>
        </div>
      </div>

      {/* Right Display Column (Preview) */}
      <div className="lg:col-span-7">
        <div className="bg-[#111622] p-6 rounded-2xl border border-slate-800/50 flex items-center justify-center">
          <div id="chef-print-container" className="w-full max-w-md bg-transparent">
            <div className="p-8 border-4 border-dashed border-rose-500/80 bg-[#161D2B] rounded-2xl flex flex-col items-center text-center gap-5 shadow-sm">
              <div className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md">
                ⚠️
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-rose-500 tracking-tight uppercase">
                  ATTENTION CHEF & SERVER
                </h2>
                <p className="text-xs text-rose-400 font-extrabold tracking-widest mt-1 uppercase">
                  Severe Food Allergy Warning
                </p>
              </div>

              <div className="w-full border-t border-rose-500/30 my-0.5"></div>

              <div className="w-full text-left space-y-3">
                <div className="text-xs text-slate-800 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div><span className="font-bold text-slate-500">Diner Name:</span> {guestName || <span className="text-slate-400 italic">Not set</span>}</div>
                  <div><span className="font-bold text-slate-500">Emergency Phone:</span> {emergencyPhone || <span className="text-slate-400 italic">Not set</span>}</div>
                </div>

                <p className="text-xs text-slate-600 leading-normal">
                  I experience severe, life-threatening allergic reactions. Please ensure my meal is 100% guarded against contact or cross-contamination from:
                </p>

                <div className="flex flex-wrap gap-1.5 py-1">
                  {allergies.map(all => (
                    <span key={all} className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {all}
                    </span>
                  ))}
                  {allergies.length === 0 && (
                    <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-1 rounded italic">
                      No Allergies selected. Please add to Profile.
                    </span>
                  )}
                </div>

                {customChefNote && (
                  <div className="p-2.5 bg-amber-50/60 border border-amber-100 text-amber-900 rounded-lg text-xs leading-relaxed italic">
                    "{customChefNote}"
                  </div>
                )}
              </div>

              <div className="w-full border-t border-rose-200"></div>

              <p className="text-[9px] text-slate-400 italic">
                This voucher can be presented directly to waitress/kitchen staff. Thank you immensely for keeping my dining experience secure!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
