import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

export function useAllergies(user: FirebaseUser | null, isAuthReady: boolean) {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    setError("Database error. Please check your connection or permissions.");
  };

  // Firestore listener for allergies (and local storage guest fallback when offline/unsigned)
  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      try {
        const localAllergies = localStorage.getItem('allergy_guest_allergies');
        if (localAllergies) {
          setAllergies(JSON.parse(localAllergies));
        } else {
          setAllergies([]);
        }
      } catch (e) {
        console.error("Local storage allergies load error:", e);
        setAllergies([]);
      }
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAllergies(docSnap.data().allergies || []);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const saveAllergiesToFirestore = async (newAllergies: string[]) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, {
        uid: user.uid,
        allergies: newAllergies,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const addAllergy = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newAllergy.trim();
    if (trimmed && !allergies.includes(trimmed.toLowerCase())) {
      const updated = [...allergies, trimmed.toLowerCase()];
      setAllergies(updated);
      setNewAllergy('');
      if (user) {
        saveAllergiesToFirestore(updated);
      } else {
        try {
          localStorage.setItem('allergy_guest_allergies', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const removeAllergy = (allergy: string) => {
    const updated = allergies.filter((a) => a !== allergy);
    setAllergies(updated);
    if (user) {
      saveAllergiesToFirestore(updated);
    } else {
      try {
        localStorage.setItem('allergy_guest_allergies', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleCommonAllergen = (commonName: string) => {
    const formatted = commonName.toLowerCase();
    let updated: string[];
    if (allergies.includes(formatted)) {
      updated = allergies.filter(a => a !== formatted);
    } else {
      updated = [...allergies, formatted];
    }
    setAllergies(updated);
    if (user) {
      saveAllergiesToFirestore(updated);
    } else {
      try {
        localStorage.setItem('allergy_guest_allergies', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return {
    allergies,
    setAllergies,
    newAllergy,
    setNewAllergy,
    error,
    setError,
    addAllergy,
    removeAllergy,
    toggleCommonAllergen
  };
}
