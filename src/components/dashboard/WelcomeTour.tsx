import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#0f172a] rounded-[2.5rem] p-8 max-w-sm w-full border border-white/10 shadow-2xl relative overflow-hidden text-center"
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-white/30 hover:text-white/80 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mt-4 mb-8">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-24 h-24 mx-auto rounded-3xl ${step.bg} flex items-center justify-center border border-white/10 mb-6`}
          >
            <Icon size={48} className={step.color} />
          </motion.div>

          <motion.h2
            key={`title-${currentStep}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-black text-white mb-3"
          >
            {step.title}
          </motion.h2>

          <motion.p
            key={`desc-${currentStep}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 font-medium leading-relaxed text-sm"
          >
            {step.description}
          </motion.p>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-violet-500' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
            {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
