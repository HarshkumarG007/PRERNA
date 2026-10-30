import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Shield, ChevronRight, X } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: 'Welcome to PRERNA',
    description: 'Your personal space for self-discovery and growth. Here, your data is 100% private and stored locally on your device.',
    icon: Sparkles,
    color: 'text-violet-400',
    bg: 'bg-violet-500/20'
  },
  {
    title: 'AI Mentor',
    description: 'Chat with your personalized AI mentor anytime. It learns from your personality to give you the best guidance.',
    icon: Brain,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20'
  },
  {
    title: 'Safe & Secure',
    description: 'You are in control. You decide what to share with your parents or school through our advanced privacy settings.',
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20'
  }
];

export const WelcomeTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('prerna_tour_completed');
    if (!hasSeenTour) {
      // Small delay so it doesn't pop up instantly jarringly
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('prerna_tour_completed', 'true');
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300"
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-[2rem] p-6 max-w-sm w-full border border-slate-100 shadow-2xl relative overflow-hidden text-center"
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close tour"
        >
          <X size={20} />
        </button>

        <div className="mt-2 mb-6">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl ${step.bg} flex items-center justify-center border border-slate-100 mb-4`}
          >
            <Icon size={40} className={step.color} />
          </div>

          <h2
            className="text-xl font-bold text-slate-800 mb-2"
          >
            {step.title}
          </h2>

          <p
            className="text-slate-600 font-normal leading-relaxed text-sm"
          >
            {step.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <div className="flex gap-2">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-violet-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold shadow-md shadow-violet-200 hover:bg-violet-700 transition-colors text-sm"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
            {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
