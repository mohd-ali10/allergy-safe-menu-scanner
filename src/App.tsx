import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2 
} from 'lucide-react';
import { cn } from './lib/utils';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Types
import { SavedScan, DishAnalysis, AnalysisError } from './types';

// Custom Hooks
import { useAuth } from './hooks/useAuth';
import { useAllergies } from './hooks/useAllergies';
import { useScanHistory } from './hooks/useScanHistory';
import { useCamera } from './hooks/useCamera';

// Layout & Screens Components
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { ScanScreen } from './components/screens/ScanScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ChefCardScreen } from './components/screens/ChefCardScreen';

export default function App() {
  // Navigation & UI Layout
  const [activeScreen, setActiveScreen] = useState<'profile' | 'scan' | 'history' | 'settings' | 'chef-card'>('scan');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('allergy_theme');
      return stored !== 'light';
    } catch {
      return true;
    }
  });

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    try {
      localStorage.setItem('allergy_theme', nextMode ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
  };

  // Auth, Allergies & History custom hooks
  const { user, isAuthReady, error: authError, login, logout, setError: setAuthError } = useAuth();
  
  const { 
    allergies, 
    setAllergies, 
    newAllergy, 
    setNewAllergy, 
    error: allergyError, 
    setError: setAllergyError, 
    addAllergy, 
    removeAllergy, 
    toggleCommonAllergen 
  } = useAllergies(user, isAuthReady);

  const { 
    scansHistory, 
    setScansHistory, 
    error: historyError, 
    setError: setHistoryError, 
    deleteScan 
  } = useScanHistory(user, isAuthReady);

  // Camera Integration hook
  const { 
    isCameraOpen, 
    cameraError, 
    videoRef, 
    startCamera, 
    stopCamera, 
    capturePhoto 
  } = useCamera();

  // Active Scan Workspace details
  const [restaurantName, setRestaurantName] = useState('');
  const [menuText, setMenuText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DishAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null);
  
  // Results view options
  const [filterOnlySafe, setFilterOnlySafe] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    try {
      return localStorage.getItem('show_allergy_disclaimer') !== 'false';
    } catch {
      return true;
    }
  });

  // History states
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Chef warning pass coordinates & print
  const [showChefCard, setShowChefCard] = useState(false);
  const [guestName, setGuestName] = useState(() => {
    try {
      return localStorage.getItem('allergy_guest_name') || '';
    } catch {
      return '';
    }
  });
  const [emergencyPhone, setEmergencyPhone] = useState(() => {
    try {
      return localStorage.getItem('allergy_emergency_phone') || '';
    } catch {
      return '';
    }
  });
  const [customChefNote, setCustomChefNote] = useState(() => {
    try {
      return localStorage.getItem('allergy_custom_chef_note') || '';
    } catch {
      return '';
    }
  });

  // Settings configs
  const [dietaryPreference, setDietaryPreference] = useState(() => {
    try {
      return localStorage.getItem('allergy_dietary_preference') || 'none';
    } catch {
      return 'none';
    }
  });
  const [strictness, setStrictness] = useState(() => {
    try {
      return localStorage.getItem('allergy_strictness') || 'standard';
    } catch {
      return 'standard';
    }
  });
  const [outputLanguage, setOutputLanguage] = useState(() => {
    try {
      return localStorage.getItem('allergy_output_language') || 'English';
    } catch {
      return 'English';
    }
  });
  const [modelSelected, setModelSelected] = useState(() => {
    try {
      return localStorage.getItem('allergy_model_selected') || 'gemini-2.5-flash';
    } catch {
      return 'gemini-2.5-flash';
    }
  });
  const [chefQuestionFormat, setChefQuestionFormat] = useState(() => {
    try {
      return localStorage.getItem('allergy_chef_question_format') || 'detailed';
    } catch {
      return 'detailed';
    }
  });

  const clearCurrentScan = () => {
    setSelectedScanId(null);
    setResults([]);
    setMenuText('');
    setImage(null);
    setRestaurantName('');
  };

  const onDeleteScan = async (scanId: string) => {
    await deleteScan(scanId, selectedScanId === scanId, clearCurrentScan);
  };

  const loadSavedScan = (scan: SavedScan) => {
    setSelectedScanId(scan.id);
    setAllergies(scan.allergies);
    setResults(scan.results);
    setMenuText(scan.menuText || '');
    setImage(scan.image || null);
    setRestaurantName(scan.restaurantName || '');
  };

  const handleAnalyze = async () => {
    if (allergies.length === 0) {
      setError("Please add at least one allergy to check against.");
      return;
    }
    if (!menuText && !image) {
      setError("Please provide a menu (text or image).");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisError(null);
    try {
      if (!navigator.onLine) {
        const errMsg = "You are currently offline. Please check your internet connection and try again.";
        setAnalysisError({
          message: errMsg,
          type: 'network',
          rawDetails: "navigator.onLine lies false"
        });
        setError(errMsg);
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allergies,
          menuText,
          image,
          dietaryPreference,
          strictness,
          outputLanguage,
          modelSelected,
        }),
      });

      if (!response.ok) {
        let errMessage = "Failed to analyze menu. Please try again.";
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch (e) {
          // Ignore parsing error
        }
        setAnalysisError({
          message: errMessage,
          type: 'api',
          rawDetails: `HTTP ${response.status}: ${response.statusText}`
        });
        throw new Error(errMessage);
      }

      const processedResults = await response.json();
      setResults(processedResults);
      setSelectedScanId(null);

      // Save to scans history
      const currentRestaurant = restaurantName.trim() || 'Restaurant Menu Scan';
      if (!user) {
        const newLocalScan: SavedScan = {
          id: 'local_' + Date.now(),
          restaurantName: currentRestaurant,
          timestamp: new Date().toISOString(),
          allergies: [...allergies],
          results: processedResults,
          menuText: menuText || '',
          image: image || null
        };
        const updatedHistory = [newLocalScan, ...scansHistory];
        setScansHistory(updatedHistory);
        try {
          localStorage.setItem('allergy_scans_history', JSON.stringify(updatedHistory));
        } catch (e) {
          console.error("Local storage sync error:", e);
        }
      } else {
        try {
          const scansColRef = collection(db, 'users', user.uid, 'scans');
          await addDoc(scansColRef, {
            restaurantName: currentRestaurant,
            allergies: [...allergies],
            results: processedResults,
            menuText: menuText || '',
            image: image || null,
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error("Cloud database scan saving failed:", e);
        }
      }
    } catch (err) {
      console.error(err);
      const errStr = err instanceof Error ? err.message : "An unexpected error occurred during menu analysis.";
      const isNetworkError = !navigator.onLine || errStr.toLowerCase().includes('fetch') || errStr.toLowerCase().includes('network');
      
      setAnalysisError({
        message: isNetworkError 
          ? "Network connection issue detected. We couldn't connect to the server." 
          : errStr,
        type: isNetworkError ? 'network' : 'general',
        rawDetails: err instanceof Error ? err.stack || err.message : String(err)
      });
      setError(isNetworkError ? "Please check your network connection and try again." : errStr);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredResults = filterOnlySafe 
    ? results.filter(r => r.risk === 'SAFE') 
    : results;

  // Render proper sub-screens on condition
  const renderScreen = () => {
    switch (activeScreen) {
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            login={login}
            allergies={allergies}
            newAllergy={newAllergy}
            setNewAllergy={setNewAllergy}
            addAllergy={addAllergy}
            removeAllergy={removeAllergy}
            toggleCommonAllergen={toggleCommonAllergen}
            dietaryPreference={dietaryPreference}
            setDietaryPreference={setDietaryPreference}
            guestName={guestName}
            setGuestName={setGuestName}
            emergencyPhone={emergencyPhone}
            setEmergencyPhone={setEmergencyPhone}
            customChefNote={customChefNote}
            setCustomChefNote={setCustomChefNote}
            setActiveScreen={setActiveScreen}
          />
        );
      case 'scan':
        return (
          <ScanScreen
            user={user}
            login={login}
            allergies={allergies}
            dietaryPreference={dietaryPreference}
            setActiveScreen={setActiveScreen}
            restaurantName={restaurantName}
            setRestaurantName={setRestaurantName}
            menuText={menuText}
            setMenuText={setMenuText}
            image={image}
            setImage={setImage}
            clearCurrentScan={clearCurrentScan}
            handleAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            isCameraOpen={isCameraOpen}
            cameraError={cameraError}
            videoRef={videoRef}
            startCamera={startCamera}
            stopCamera={stopCamera}
            capturePhoto={capturePhoto}
            error={error}
            setError={setError}
            analysisError={analysisError}
            setAnalysisError={setAnalysisError}
            showDisclaimer={showDisclaimer}
            setShowDisclaimer={setShowDisclaimer}
            results={results}
            filteredResults={filteredResults}
            filterOnlySafe={filterOnlySafe}
            setFilterOnlySafe={setFilterOnlySafe}
            chefQuestionFormat={chefQuestionFormat}
            setShowChefCard={setShowChefCard}
            scansHistory={scansHistory}
            selectedScanId={selectedScanId}
            loadSavedScan={loadSavedScan}
            onDeleteScan={onDeleteScan}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            scansHistory={scansHistory}
            selectedScanId={selectedScanId}
            setSelectedScanId={setSelectedScanId}
            historySearchQuery={historySearchQuery}
            setHistorySearchQuery={setHistorySearchQuery}
            loadSavedScan={loadSavedScan}
            deleteScan={onDeleteScan}
            setActiveScreen={setActiveScreen}
            results={results}
            restaurantName={restaurantName}
            allergies={allergies}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            guestName={guestName}
            setGuestName={setGuestName}
            emergencyPhone={emergencyPhone}
            setEmergencyPhone={setEmergencyPhone}
            customChefNote={customChefNote}
            setCustomChefNote={setCustomChefNote}
            dietaryPreference={dietaryPreference}
            setDietaryPreference={setDietaryPreference}
            strictness={strictness}
            setStrictness={setStrictness}
            outputLanguage={outputLanguage}
            setOutputLanguage={setOutputLanguage}
            modelSelected={modelSelected}
            setModelSelected={setModelSelected}
            allergies={allergies}
            scansHistory={scansHistory}
          />
        );
      case 'chef-card':
        return (
          <ChefCardScreen
            guestName={guestName}
            setGuestName={setGuestName}
            emergencyPhone={emergencyPhone}
            setEmergencyPhone={setEmergencyPhone}
            customChefNote={customChefNote}
            setCustomChefNote={setCustomChefNote}
            allergies={allergies}
          />
        );
      default:
        return null;
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-amber-500/20 transition-all duration-300",
      isDarkMode ? "bg-[#0B0F19] text-slate-100 dark" : "bg-slate-50 text-slate-900 light"
    )}>
      {/* Header */}
      <Header
        user={user}
        login={login}
        logout={logout}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />

      {/* Embedded Global Styles for Print Mode & Layout overrides */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, nav, footer, button, .print\\:hidden, section, main > *:not(#chef-print-container) {
            display: none !important;
          }
          #chef-print-container {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Main Content Pane */}
      <main className="max-w-5xl mx-auto px-4 pt-8 pb-32">
        {renderScreen()}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 py-8 bg-[#151B26]">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <ShieldAlert className="text-amber-500 w-4 h-4" />
            <span>AllergySafe Guardian Portal</span>
          </div>
          <p className="text-[10px] text-slate-500 max-w-lg mx-auto leading-normal">
            Logic processed server-side. Medical disclaimer: Always verify with restaurant staff as recipes and kitchen cross-contamination risks can change dynamically.
          </p>
        </div>
      </footer>

      {/* Chef Card Modal */}
      <AnimatePresence>
        {showChefCard && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#151B26] w-full max-w-lg rounded-2xl shadow-xl border border-slate-800/80 overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#1d2433]">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-slate-100 text-sm">Printable Dining Helper</span>
                </div>
                <button 
                  onClick={() => setShowChefCard(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Body */}
              <div className="p-8" id="chef-warning-card">
                <div className="p-6 border-4 border-dashed border-rose-500 bg-[#161D2B] rounded-2xl flex flex-col items-center text-center gap-4 shadow-sm print:border-red-600 print:bg-white">
                  <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md">
                    ⚠️
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-rose-500 tracking-tight uppercase">
                      Attention Chef & Waitstaff
                    </h2>
                    <p className="text-xs text-rose-400 font-extrabold tracking-widest mt-1 uppercase">
                      Severe Food Allergy Notice
                    </p>
                  </div>

                  <div className="w-full border-t border-rose-500/30 my-1"></div>

                  <div className="w-full text-left space-y-3">
                    <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                      Dear Server/Kitchen Team,
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      I have severe, life-threatening allergic reactions. Please ensure any meal prepared for me has absolutely no contact or cross-contamination with the following ingredients:
                    </p>

                    <div className="flex flex-wrap gap-2 py-1">
                      {allergies.map((allergy) => (
                        <span 
                          key={allergy} 
                          className="bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-rose-600"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>

                    {results.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                          Dishes I’d like to order:
                        </p>
                        <div className="p-3 bg-[#121721] rounded-xl border border-slate-800/80 space-y-1">
                          {results.filter(r => r.risk === 'SAFE').map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{item.dish} - (AI Risk Evaluated: Safe)</span>
                            </div>
                          ))}
                          {results.filter(r => r.risk === 'SAFE').length === 0 && (
                            <p className="text-xs text-slate-500 italic">No safe dishes detected in menu yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full border-t border-rose-500/30 my-1"></div>

                  <p className="text-[10px] text-slate-500 italic font-medium leading-normal">
                    Thank you immensely for your extreme vigilance and support in keeping my dining experience allergy-safe.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-800 flex gap-3 justify-end bg-[#1d2433] print:hidden">
                <button
                  type="button"
                  onClick={() => {
                    const cardText = `SEVERE FOOD ALLERGY NOTICE\n\nDear Server / Chef,\nI have severe, life-threatening allergies. Please ensure no cross-contamination or contact with: ${allergies.join(', ').toUpperCase()}\n\nDishes requesting: ${results.filter(r => r.risk === 'SAFE').map(r => r.dish).join(', ')}`;
                    navigator.clipboard.writeText(cardText);
                  }}
                  className="px-4 py-2 bg-[#1C2333] border border-slate-850 text-slate-300 rounded-xl text-xs font-bold hover:bg-[#232b3d] transition-colors cursor-pointer"
                >
                  Copy Card Text
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                >
                  Print Allergy Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating central Navigation Component */}
      <BottomNavigation
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
      />
    </div>
  );
}
