import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { SavedScan } from '../types';

export function useScanHistory(user: FirebaseUser | null, isAuthReady: boolean) {
  const [scansHistory, setScansHistory] = useState<SavedScan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      try {
        const savedOffline = localStorage.getItem('allergy_scans_history');
        if (savedOffline) {
          setScansHistory(JSON.parse(savedOffline));
        } else {
          setScansHistory([]);
        }
      } catch (e) {
        console.error("Local storage history load error:", e);
        setScansHistory([]);
      }
      return;
    }

    const scansColRef = collection(db, 'users', user.uid, 'scans');
    const q = query(scansColRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbScans: SavedScan[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbScans.push({
          id: docSnap.id,
          restaurantName: data.restaurantName || 'Menu Analysis',
          timestamp: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          allergies: data.allergies || [],
          results: data.results || [],
          menuText: data.menuText || '',
          image: data.image || null
        });
      });
      setScansHistory(dbScans);
    }, (err) => {
      console.error("Scans subscription failed:", err);
      setError("Failed to load history.");
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const deleteScan = async (
    scanId: string, 
    isCurrentSelected: boolean, 
    clearCurrentScan: () => void
  ) => {
    if (!user) {
      const updated = scansHistory.filter(s => s.id !== scanId);
      setScansHistory(updated);
      try {
        localStorage.setItem('allergy_scans_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      if (isCurrentSelected) {
        clearCurrentScan();
      }
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'scans', scanId));
      if (isCurrentSelected) {
        clearCurrentScan();
      }
    } catch (e) {
      console.error("Error deleting scan from Firestore:", e);
      setError("Failed to delete scan from Cloud Database.");
    }
  };

  return {
    scansHistory,
    setScansHistory,
    error,
    setError,
    deleteScan
  };
}
