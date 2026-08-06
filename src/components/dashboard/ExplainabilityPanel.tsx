import React from 'react';
import { motion } from 'framer-motion';
import { CareerPathway } from '../../ai/careerClassifier';

interface ExplainabilityPanelProps {
  pathway: CareerPathway;
  onClose: () => void;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ pathway, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl max-w-2xl w-full backdrop-blur-xl m-4 text-white"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-emerald-400 mb-1">Why this recommendation?</h2>
            <h3 className="text-xl font-medium text-white">{pathway.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
            <h4 className="text-lg font-semibold text-white/90 mb-3">Trait Alignment</h4>
            <p className="text-white/80 leading-relaxed">
              Our classifier looks at your combined <strong>Big Five</strong> and <strong>RIASEC</strong> traits. 
              {pathway.category === 'startup' && ' Your high Openness and Enterprising scores strongly align with the risk-taking and innovation required in startups.'}
              {pathway.category === 'government' && ' Your high Conscientiousness and Social traits indicate you value stability and community impact, essential for public service.'}
              {pathway.category === 'corporate' && ' Your methodical approach (Investigative/Realistic) combined with structure (Conscientiousness) fits perfectly in technical or corporate environments.'}
              {pathway.category === 'creative' && ' Your high Openness and Artistic traits suggest you thrive in unstructured, expressive environments.'}
            </p>
          </div>
          
          <div className="bg-black/20 p-6 rounded-2xl border border-white/10 flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-white/90 mb-1">Confidence Score</h4>
              <p className="text-white/60 text-sm">Based on the strength of your trait signals</p>
            </div>
            <div className="text-4xl font-black text-emerald-400">
              {pathway.matchScore}%
            </div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h4 className="text-blue-300 font-bold text-sm uppercase tracking-wider mb-1">Data Privacy</h4>
              <p className="text-white/70 text-sm">
                This recommendation was generated entirely on your device. Your personality traits never leave your computer.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
