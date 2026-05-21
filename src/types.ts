import { User as FirebaseUser } from 'firebase/auth';

export interface DishAnalysis {
  dish: string;
  ingredients: string[];
  allergens: string[];
  risk: "SAFE" | "POSSIBLE_RISK" | "HIGH_RISK";
  explanation: string;
  confidence: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export interface SavedScan {
  id: string;
  restaurantName: string;
  timestamp: string;
  allergies: string[];
  results: DishAnalysis[];
  menuText?: string;
  image?: string | null;
}

export interface AnalysisError {
  message: string;
  type: 'network' | 'api' | 'validation' | 'general';
  rawDetails?: string;
}

export const COMMON_ALLERGENS = [
  { id: 'peanuts', name: 'Peanuts', icon: '🥜' },
  { id: 'dairy', name: 'Dairy / Milk', icon: '🥛' },
  { id: 'gluten', name: 'Gluten / Wheat', icon: '🌾' },
  { id: 'soy', name: 'Soy', icon: '🫘' },
  { id: 'eggs', name: 'Eggs', icon: '🥚' },
  { id: 'tree nuts', name: 'Tree Nuts', icon: '🌰' },
  { id: 'fish', name: 'Fish', icon: '🐟' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
  { id: 'sesame', name: 'Sesame', icon: '🌱' },
  { id: 'mustard', name: 'Mustard', icon: '🌭' },
];
