import React from 'react';
import { FileText, History, Printer, Sliders, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface BottomNavigationProps {
  activeScreen: 'profile' | 'scan' | 'history' | 'settings' | 'chef-card';
  setActiveScreen: (screen: 'profile' | 'scan' | 'history' | 'settings' | 'chef-card') => void;
}

export function BottomNavigation({ activeScreen, setActiveScreen }: BottomNavigationProps) {
  const navItems = [
    { id: 'scan', label: 'SCANNER', Icon: FileText },
    { id: 'history', label: 'SAVED', Icon: History },
    { id: 'chef-card', label: 'CHEF CARD', Icon: Printer },
    { id: 'settings', label: 'SETTINGS', Icon: Sliders },
    { id: 'profile', label: 'PROFILE', Icon: Shield }
  ] as const;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg bg-[#121721]/95 backdrop-blur-md border border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] px-4 py-2 flex items-center justify-between print:hidden">
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        const { Icon } = item;
        return (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className="relative flex flex-col items-center justify-center focus:outline-none transition-all duration-300 group cursor-pointer"
            style={{ width: '64px', height: '64px' }}
          >
            {isActive ? (
              // Active state: central prominent yellow/amber circle with white icon and text inside
              <motion.div
                layoutId="activeTabCircle"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="absolute inset-0 bg-[#fe9a00] rounded-full flex flex-col items-center justify-center shadow-lg shadow-[#fe9a00]/40 scale-110 z-10"
              >
                <Icon className="w-5 h-5 text-white mb-0.5" />
                <span className="text-[8px] font-black tracking-wider text-white uppercase text-center leading-none">
                  {item.label}
                </span>
              </motion.div>
            ) : (
              // Inactive state: slate icon and text below
              <div className="flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95">
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors mb-1" />
                <span className="text-[9px] font-black tracking-wider text-slate-400 group-hover:text-slate-200 uppercase leading-none">
                  {item.label}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
