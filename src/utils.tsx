import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { DishAnalysis } from './types';

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'SAFE': return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/10 dark:border-emerald-500/20';
    case 'POSSIBLE_RISK': return 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/10 dark:border-amber-500/20';
    case 'HIGH_RISK': return 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/10 dark:border-rose-500/20';
    default: return 'text-gray-600 bg-gray-50 border-gray-100 dark:text-slate-400 dark:bg-slate-900/10 dark:border-slate-800/20';
  }
};

export const getRiskIcon = (risk: string) => {
  switch (risk) {
    case 'SAFE': return <CheckCircle2 className="w-5 h-5" />;
    case 'POSSIBLE_RISK': return <AlertTriangle className="w-5 h-5" />;
    case 'HIGH_RISK': return <AlertCircle className="w-5 h-5" />;
    default: return null;
  }
};

export const generateChefQuestion = (
  item: DishAnalysis, 
  allergies: string[], 
  chefQuestionFormat: string
) => {
  const allergens = item.allergens.length > 0 ? item.allergens.join(", ") : allergies.join(", ");
  if (chefQuestionFormat === 'brief') {
    return `Does "${item.dish}" contain ${allergens}? I have a severe allergy.`;
  }
  if (chefQuestionFormat === 'professional') {
    return `ALLERGY VERIFICATION FOR CHEF: Please verify that "${item.dish}" has 100% NO contact, traces, or cross-contamination with ${allergens}. Extreme medical precaution needed.`;
  }
  return `Hi, I have a severe allergy to ${allergens}. Does the "${item.dish}" contain any of these, or is it prepared in a way that might cause cross-contamination?`;
};
