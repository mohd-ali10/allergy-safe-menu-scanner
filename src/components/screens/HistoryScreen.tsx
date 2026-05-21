import React from 'react';
import { History, Search, X, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SavedScan, DishAnalysis } from '../../types';
import { getRiskColor, getRiskIcon } from '../../utils';

interface HistoryScreenProps {
  scansHistory: SavedScan[];
  selectedScanId: string | null;
  setSelectedScanId: (id: string | null) => void;
  historySearchQuery: string;
  setHistorySearchQuery: (query: string) => void;
  loadSavedScan: (scan: SavedScan) => void;
  deleteScan: (scanId: string) => Promise<void>;
  setActiveScreen: (screen: 'profile' | 'scan' | 'history' | 'settings' | 'chef-card') => void;
  results: DishAnalysis[];
  restaurantName: string;
  allergies: string[];
}

export function HistoryScreen({
  scansHistory,
  selectedScanId,
  setSelectedScanId,
  historySearchQuery,
  setHistorySearchQuery,
  loadSavedScan,
  deleteScan,
  setActiveScreen,
  results,
  restaurantName,
  allergies
}: HistoryScreenProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-[fadeIn_0.3s_ease]">
      {/* Left Column: List of saved scans with search query */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-[#151B26] p-5 rounded-2xl border border-slate-800/80 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            Saved Reports History
          </h2>
          
          {/* Search query input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              placeholder="Search restaurant..."
              className="w-full pl-9 pr-4 py-2 bg-[#1d2433] border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-550/15 focus:border-[#fe9a00]"
            />
            {historySearchQuery && (
              <button 
                onClick={() => setHistorySearchQuery('')} 
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 bg-transparent border-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid list of historic items */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {scansHistory
              .filter(scan => scan.restaurantName.toLowerCase().includes(historySearchQuery.toLowerCase()))
              .map((scan) => {
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
                    onClick={() => {
                      setSelectedScanId(scan.id);
                      loadSavedScan(scan);
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all relative group cursor-pointer",
                      isSelected 
                        ? "border-amber-500 bg-amber-500/10 font-bold" 
                        : "border-slate-800 bg-[#121721] text-slate-300 hover:bg-[#1d2433]/65"
                    )}
                  >
                    <div className="flex items-start justify-between pr-6">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 truncate max-w-[140px]">
                          {scan.restaurantName || 'Unnamed Restaurant'}
                        </h4>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{dateFormatted}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScan(scan.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/80 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer"
                        title="Delete from list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {safeCount} Safe
                      </span>
                      <span className="text-[9px] bg-amber-500/10 text-[#fe9a00] px-1.5 py-0.5 rounded border border-[#fe9a00]/20">
                        {scan.allergies.length} Allergens
                      </span>
                    </div>
                  </div>
                );
              })}
            {scansHistory.filter(scan => scan.restaurantName.toLowerCase().includes(historySearchQuery.toLowerCase())).length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 italic">No saved scans match search query.</p>
                <button 
                  onClick={() => setActiveScreen('scan')} 
                  className="mt-3 text-xs bg-amber-500 text-slate-950 hover:bg-amber-600 px-3 py-1.5 rounded-lg font-bold border-0 cursor-pointer"
                >
                  New Menu Scan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Analysis Detail Viewer */}
      <div className="lg:col-span-8">
        <div className="bg-[#151B26] min-h-[500px] rounded-2xl border border-slate-800/80 shadow-sm p-6">
          {selectedScanId ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Saved Inspection Report
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-100 mt-1">
                    {restaurantName || 'Unnamed Scan'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Allergens guarded for this analysis: <span className="font-bold text-amber-500">{allergies.join(', ')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const activeScan = scansHistory.find(s => s.id === selectedScanId);
                      if (activeScan) {
                        loadSavedScan(activeScan);
                        setActiveScreen('scan');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 hover:bg-amber-600 text-xs font-bold rounded-lg shadow-sm cursor-pointer border-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Load into Workspace
                  </button>

                  <button
                    onClick={() => deleteScan(selectedScanId)}
                    className="p-2 text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer bg-transparent border-0"
                    title="Delete Scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Results list */}
              <div className="space-y-4">
                {results.map((item, idx) => (
                  <div key={item.dish + idx} className="border border-slate-800 bg-[#121721] rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all text-left">
                    <div className={cn("px-4 py-2.5 flex items-center justify-between border-b text-xs font-bold", getRiskColor(item.risk))}>
                      <div className="flex items-center gap-1.5">
                        {getRiskIcon(item.risk)}
                        <span>{item.risk.replace('_', ' ')}</span>
                      </div>
                      <span>Confidence: {item.confidence}%</span>
                    </div>
                    <div className="p-4 space-y-3 bg-[#151B26]">
                      <div>
                        <h4 className="text-base font-bold text-slate-100">{item.dish}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.explanation}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.ingredients.map(ing => (
                          <span key={ing} className="bg-[#1d2433] border border-slate-800 text-[11px] text-slate-300 px-2 py-0.5 rounded">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <History className="w-16 h-16 text-slate-700 mb-4 animate-[pulse_3s_ease-in-out_infinite]" />
              <h3 className="text-lg font-bold text-slate-200">Select standard scan history</h3>
              <p className="text-sm text-slate-405 text-slate-400 max-w-sm mt-1 leading-normal">
                Choose any restaurant scan from the left catalog panel to populate and view full safety findings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
