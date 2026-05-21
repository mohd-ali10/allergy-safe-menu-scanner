import React from 'react';
import { ShieldAlert, Sun, Moon, User, LogOut, LogIn } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { cn } from '../../lib/utils';

interface HeaderProps {
  user: FirebaseUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export function Header({ user, login, logout, toggleTheme, isDarkMode }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-[#111622]/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldAlert className="text-[#0B0F19] w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-100">
            Allergy<span className="text-[#fe9a00]">Safe</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-sm",
              isDarkMode 
                ? "border-slate-800 bg-[#151B26] hover:bg-slate-800 text-amber-500 hover:text-amber-400" 
                : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-amber-600"
            )}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-200">{user.displayName}</span>
                <span className="text-[10px] text-slate-400">Allergy Profile Active</span>
              </div>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-800" />
              ) : (
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-amber-600 transition-all shadow-md"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
