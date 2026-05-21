import React, { useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  LogIn, 
  ChevronRight, 
  Utensils, 
  Upload, 
  Camera, 
  X, 
  Search, 
  Loader2, 
  AlertCircle, 
  RotateCcw, 
  History, 
  Clock, 
  Trash2, 
  Printer, 
  Filter, 
  ShieldAlert, 
  MessageSquare,
  Check 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DishAnalysis, SavedScan, AnalysisError } from '../../types';
import { getRiskColor, getRiskIcon, generateChefQuestion } from '../../utils';

interface ScanScreenProps {
  // Authentication & Settings
  user: FirebaseUser | null;
  login: () => Promise<void>;
  
  // Profile Parameters
  allergies: string[];
  dietaryPreference: string;
  setActiveScreen: (screen: 'profile' | 'scan' | 'history' | 'settings' | 'chef-card') => void;

  // Scanner State & Inputs
  restaurantName: string;
  setRestaurantName: (val: string) => void;
  menuText: string;
  setMenuText: (val: string) => void;
  image: string | null;
  setImage: (val: string | null) => void;
  clearCurrentScan: () => void;
  handleAnalyze: () => void;
  isAnalyzing: boolean;

  // Camera Integration
  isCameraOpen: boolean;
  cameraError: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startCamera: () => void;
  stopCamera: () => void;
  capturePhoto: (onCapture: (dataUrl: string) => void) => void;

  // Error Feedback
  error: string | null;
  setError: (val: string | null) => void;
  analysisError: AnalysisError | null;
  setAnalysisError: (err: AnalysisError | null) => void;

  // Disclaimer State
  showDisclaimer: boolean;
  setShowDisclaimer: (val: boolean) => void;

  // Analysis Results & Filters
  results: DishAnalysis[];
  filteredResults: DishAnalysis[];
  filterOnlySafe: boolean;
  setFilterOnlySafe: (val: boolean) => void;
  chefQuestionFormat: string;
  setShowChefCard: (val: boolean) => void;

  // Scan History
  scansHistory: SavedScan[];
  selectedScanId: string | null;
  loadSavedScan: (scan: SavedScan) => void;
  onDeleteScan: (scanId: string) => void;
}

export function ScanScreen({
  user,
  login,
  allergies,
  dietaryPreference,
  setActiveScreen,
  restaurantName,
  setRestaurantName,
  menuText,
  setMenuText,
  image,
  setImage,
  clearCurrentScan,
  handleAnalyze,
  isAnalyzing,
  isCameraOpen,
  cameraError,
  videoRef,
  startCamera,
  stopCamera,
  capturePhoto,
  error,
  setError,
  analysisError,
  setAnalysisError,
  showDisclaimer,
  setShowDisclaimer,
  results,
  filteredResults,
  filterOnlySafe,
  setFilterOnlySafe,
  chefQuestionFormat,
  setShowChefCard,
  scansHistory,
  selectedScanId,
  loadSavedScan,
  onDeleteScan
}: ScanScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCaptureSnapshot = () => {
    capturePhoto((dataUrl) => {
      setImage(dataUrl);
    });
  };

  return (
    <>
      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="relative mb-8 p-4 pr-10 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200 leading-relaxed">
            <span className="font-bold">Disclaimer:</span> This is AI-generated analysis based on the provided menu. It may not account for seasonal changes or kitchen cross-contamination. <span className="font-bold underline">Always confirm with the restaurant staff before consuming.</span>
          </p>
          <button
            onClick={() => {
              setShowDisclaimer(false);
              try {
                localStorage.setItem('show_allergy_disclaimer', 'false');
              } catch (e) {
                console.error(e);
              }
            }}
            className="absolute top-3 right-3 p-1.5 text-amber-400 hover:text-[#fe9a00] hover:bg-amber-500/15 rounded-lg transition-colors cursor-pointer"
            aria-label="Close disclaimer"
            title="Dismiss Disclaimer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!user && (
        <div className="mb-8 p-6 bg-[#151B26] border border-slate-800/80 rounded-2xl text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-100 mb-2">Save Your Allergy Profile</h2>
          <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
            Sign in with Google to securely save your allergies and access them from any device.
          </p>
          <button 
            onClick={login}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            Get Started
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-8 text-left">
          
          {/* Active Allergies Safeguards Indicator Panel */}
          <div className="bg-[#151B26] p-5 rounded-2xl border border-slate-800/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                🛡️ Active Safety Filters
              </h3>
              <button
                type="button"
                onClick={() => setActiveScreen('profile')}
                className="text-[10px] uppercase font-black text-[#fe9a00] hover:text-[#fe9a00]/80 tracking-wider flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
              >
                Configure Profile <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[35px] items-center">
              {allergies.map(all => (
                <span key={all} className="bg-amber-500/10 text-[#fe9a00] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded border border-[#fe9a00]/25">
                  {all}
                </span>
              ))}
              {dietaryPreference !== 'none' && (
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded border border-emerald-500/20">
                  Diet: {dietaryPreference}
                </span>
              )}
              {allergies.length === 0 && dietaryPreference === 'none' && (
                <div className="text-xs text-rose-400 font-bold py-1 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>No active allergy constraints. Please configure your profile first!</span>
                </div>
              )}
            </div>
          </div>

          {/* Menu Input Section */}
          <section className="bg-[#151B26] p-6 rounded-2xl border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-slate-200">Menu Input</h2>
              </div>
              {(results.length > 0 || menuText || image || restaurantName) && (
                <button 
                  onClick={clearCurrentScan} 
                  className="text-xs text-amber-500 hover:text-amber-400 font-bold hover:underline cursor-pointer bg-transparent border-0"
                >
                  Clear Active Scan
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Restaurant Name input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. Bella Italia, Tokyo Sushi"
                  className="w-full px-4 py-2 bg-[#1d2433] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-550/15 focus:border-[#fe9a00] text-sm text-slate-100 transition-all"
                />
              </div>

              {/* Text Paste Block */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Menu Text Details
                </label>
                <textarea
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                  placeholder="Paste menu details (names, descriptions, ingredient lists) here..."
                  className="w-full h-32 px-4 py-3 bg-[#1d2433] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-550/15 focus:border-[#fe9a00] text-sm text-slate-100 transition-all resize-none"
                />
              </div>

              {/* Camera / Photo Upload Frame */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Menu Photo
                </label>

                {isCameraOpen ? (
                  <div className="relative bg-black rounded-xl overflow-hidden aspect-video border border-slate-800 shadow-inner">
                    <video 
                      ref={videoRef as any} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={onCaptureSnapshot}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-md cursor-pointer"
                      >
                        Capture Snapshot
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    {cameraError && (
                      <div className="absolute inset-0 bg-black/90 p-4 flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="w-8 h-8 text-rose-500 mb-1" />
                        <p className="text-xs text-slate-300 font-bold">{cameraError}</p>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="mt-3 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Dismiss Window
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all min-h-[110px]",
                        image ? "border-amber-500 bg-amber-500/10 text-amber-300" : "border-slate-800 text-slate-300 hover:border-amber-500 hover:bg-[#1d2433]/50"
                      )}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 text-slate-400" />
                      <p className="text-xs font-bold text-slate-300">Attach Image</p>
                      <p className="text-[10px] text-slate-500">supports JPEG, PNG</p>
                    </div>

                    <div 
                      onClick={startCamera}
                      className="border-2 border-dashed border-slate-800 text-slate-305 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center hover:border-amber-500 hover:bg-[#1d2433]/50 transition-all min-h-[110px]"
                    >
                      <Camera className="w-5 h-5 text-slate-400" />
                      <p className="text-xs font-bold text-slate-300">Device Camera</p>
                      <p className="text-[10px] text-slate-500">Snap menu live</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Show active file preview if present */}
              {image && !isCameraOpen && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 shadow-sm">
                  <img src={image} alt="Menu screenshot preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-[#151B26]/95 rounded-full text-slate-200 hover:bg-[#1C2333] shadow-md cursor-pointer border-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (allergies.length === 0) || (!menuText && !image)}
                className="w-full py-4 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-lg shadow-amber-500/10 hover:bg-amber-600 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Menu...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Menu
                  </>
                )}
              </button>
              
              {analysisError ? (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-5 space-y-4 text-left animate-[fadeIn_0.2s_ease]">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-950/50 rounded-xl text-rose-400 shrink-0">
                      <AlertCircle className="w-5 h-5 animate-[bounce_1.5s_infinite]" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-extrabold text-rose-100">
                        {analysisError.type === 'network' ? 'Network Connection Issue' : 'Menu Analysis Error'}
                      </h4>
                      <p className="text-xs text-rose-300 font-medium leading-relaxed">
                        {analysisError.message}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-rose-900/20 pt-4 space-y-3">
                    <div className="text-[10px] font-black uppercase text-rose-200 tracking-wider">
                      Suggested Troubleshooting Steps:
                    </div>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2 text-xs text-rose-300 leading-normal">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Check network connection:</strong> Verify your active Wi-Fi or cellular data signal. Try reloading a website or test if you are in a cellular dead zone.
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-rose-300 leading-normal">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Re-upload or re-enter the menu:</strong> Try re-selecting or taking a clearer photo of the menu. Ensure there is no heavy glare, or clear and paste the menu text again.
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-rose-300 leading-normal">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Review AI settings:</strong> Ensure your dietary choices and strictness settings in the panel are well-configured.
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-rose-300 leading-normal">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Shorten menu text input:</strong> If the text you pasted is extremely long, try trimming it down or pasting single page sections to avoid prompt overflow.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {analysisError.rawDetails && (
                    <div className="pt-2">
                      <details className="cursor-pointer group">
                        <summary className="text-[10px] font-bold text-rose-400 hover:text-rose-200 transition-colors uppercase tracking-wider outline-none select-none">
                          View Technical Log
                        </summary>
                        <pre className="mt-2 p-2.5 bg-black/40 rounded-lg text-[10px] font-mono text-rose-400 overflow-x-auto leading-normal border border-rose-900/30">
                          {analysisError.rawDetails}
                        </pre>
                      </details>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#fe9a00] hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Analysis
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnalysisError(null);
                        setError(null);
                      }}
                      className="py-2.5 px-4 border border-rose-900/40 hover:bg-rose-900/10 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer bg-transparent"
                    >
                      Dismiss Error
                    </button>
                  </div>
                </div>
              ) : (
                error && (
                  <p className="text-xs text-rose-500 font-bold text-center leading-relaxed">{error}</p>
                )
              )}
            </div>
          </section>

          {/* Historical Scans Index Section */}
          {scansHistory.length > 0 && (
            <section className="bg-[#151B26] p-6 rounded-2xl border border-slate-800/80 shadow-sm animate-[fadeIn_0.3s_ease]">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-slate-200">Safe Scan History</h2>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {scansHistory.map((scan) => {
                  const isSelected = selectedScanId === scan.id;
                  const scanDate = new Date(scan.timestamp);
                  const dateFormatted = isNaN(scanDate.getTime()) 
                     ? 'Recently analyzed' 
                     : scanDate.toLocaleDateString(undefined, {
                         month: 'short',
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                       });

                  const safeCount = scan.results.filter(r => r.risk === 'SAFE').length;
                  
                  return (
                    <div
                      key={scan.id}
                      onClick={() => loadSavedScan(scan)}
                      className={cn(
                        "p-3 rounded-xl border transition-all flex flex-col gap-2 relative group cursor-pointer",
                        isSelected 
                          ? "border-amber-500 bg-amber-500/10" 
                          : "border-slate-800 hover:bg-[#1d2433]/70 text-slate-300"
                      )}
                    >
                      <div className="flex items-start justify-between pr-8">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200 truncate max-w-[160px]">
                            {scan.restaurantName}
                          </h4>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{dateFormatted}</span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteScan(scan.id);
                          }}
                          className="absolute top-3 right-3 text-slate-450 hover:text-rose-450 p-1 rounded-lg hover:bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0 bg-transparent"
                          title="Delete scan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {safeCount} Safe Dishes
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold self-center">
                          {scan.allergies.length} Allergens tracked
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <div className="bg-[#151B26] min-h-[600px] rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <h2 className="font-semibold text-slate-200">Safety Analysis</h2>
              <div className="flex items-center gap-4">
                {results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowChefCard(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      title="Print severe allergy warning helper to hand over to servers/cooks"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Chef Card
                    </button>

                    <button 
                      onClick={() => setFilterOnlySafe(!filterOnlySafe)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                        filterOnlySafe ? "bg-emerald-600 text-white border-emerald-500" : "bg-[#1C2333]/90 text-slate-300 border-slate-800 hover:bg-[#232b3d]"
                      )}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      {filterOnlySafe ? "Safe Only" : "Show All"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 font-sans">
              {!isAnalyzing && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-[#1d2433] rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-10 h-10 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-100 mb-2">Ready to Analyze</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">
                    Add your allergies and upload a menu to see safety ratings for each dish.
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex flex-col gap-3 p-4 border border-slate-800 rounded-xl">
                      <div className="h-6 bg-[#1d2433] rounded w-1/3"></div>
                      <div className="h-4 bg-[#1d2433] rounded w-full"></div>
                      <div className="h-4 bg-[#1d2433] rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredResults.map((item, idx) => (
                    <motion.div
                      key={item.dish + idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 bg-[#121721] transition-all text-left"
                    >
                      <div className={cn("px-4 py-3 flex items-center justify-between border-b border-slate-800/50", getRiskColor(item.risk))}>
                        <div className="flex items-center gap-2">
                          {getRiskIcon(item.risk)}
                          <span className="font-bold text-sm tracking-wide">{item.risk.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase opacity-60 leading-none">Confidence</span>
                            <span className="text-xs font-black">{item.confidence}%</span>
                          </div>
                          <div className="w-12 h-1.5 bg-black/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-current transition-all duration-1000" 
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-100 mb-1">{item.dish}</h3>
                          <p className="text-sm text-slate-305 text-slate-305 text-slate-300 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ingredients</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {item.ingredients.map((ing) => (
                                <span key={ing} className="text-xs px-2 py-0.5 bg-[#1d2433] text-slate-300 rounded border border-slate-800 font-medium">
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {item.allergens.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detected Allergens</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {item.allergens.map((all) => (
                                  <span key={all} className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-300 rounded border border-rose-500/20 font-medium">
                                    {all}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Ask the Chef Section */}
                        <div className="pt-4 border-t border-slate-800/60">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Ask the Chef
                          </h4>
                          <div className="bg-[#1c2333]/70 p-3 rounded-xl border border-slate-800/60 group-hover:border-amber-500/25 transition-colors">
                            <p className="text-xs text-slate-300 italic leading-relaxed">
                              "{generateChefQuestion(item, allergies, chefQuestionFormat)}"
                            </p>
                            <button 
                              onClick={() => navigator.clipboard.writeText(generateChefQuestion(item, allergies, chefQuestionFormat))}
                              className="mt-2 text-[10px] font-bold text-amber-450 hover:text-amber-300 flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                            >
                              Copy Question <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filterOnlySafe && filteredResults.length === 0 && results.length > 0 && (
                  <div className="text-center py-10 animate-[fadeIn_0.2s_ease]">
                    <p className="text-slate-400 text-sm italic">No safe dishes found with current filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
