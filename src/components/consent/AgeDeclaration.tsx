import React, { useState } from 'react';
import { AccountType } from '../../engine/consent/ageTierGate';

interface AgeDeclarationProps {
  onComplete: (age: number, accountType: AccountType) => void;
}

export const AgeDeclaration: React.FC<AgeDeclarationProps> = ({ onComplete }) => {
  const [age, setAge] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setError('Please enter a valid age.');
      return;
    }

    const accountType: AccountType = ageNum < 18 ? 'under_18' : 'adult';
    onComplete(ageNum, accountType);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 glass-panel space-y-8 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
      
      <div className="text-center relative z-10">
        <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-indigo-100 animate-pulse-soft">
          <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome to PRERNA</h2>
        <p className="mt-3 text-sm text-slate-500 font-medium">To begin your journey, please enter your age.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label htmlFor="age" className="block text-sm font-semibold text-slate-700 mb-2">
            Your Age
          </label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setError('');
            }}
            className="block w-full rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-4 transition-all duration-200"
            placeholder="e.g., 15"
          />
          {error && <p className="mt-2 text-sm text-red-500 font-medium animate-fade-in-up">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:-translate-y-0.5"
        >
          Continue securely
        </button>
      </form>
      
      {/* Decorative background blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
    </div>
  );
};
