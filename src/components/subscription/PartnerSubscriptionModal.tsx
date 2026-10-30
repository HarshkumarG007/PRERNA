import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Check, 
  Crown, 
  ShieldCheck, 
  ArrowRight,
  QrCode
} from 'lucide-react';
import { useSubscriptionStore, PartnerPlanTier } from '../../store/subscriptionStore';
import { somaticAudio } from '../../utils/audioSynthesis';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';
import { PaymentDetails } from '../../services/paymentGateway';

interface PartnerSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerSubscriptionModal: React.FC<PartnerSubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { partnerPlan, partnerTrialDaysRemaining, partnerExpiresAt, upgradePartnerPlan, cancelPartnerPlan } = useSubscriptionStore();
  const [selectedTier, setSelectedTier] = useState<PartnerPlanTier>('partner_pro_annual');
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<PaymentDetails | null>(null);

  if (!isOpen) return null;

  const getTierAmount = (tier: PartnerPlanTier): number => {
    switch (tier) {
      case 'partner_pro_monthly': return 299;
      case 'partner_pro_annual': return 1999;
      case 'partner_lifetime': return 4999;
      default: return 299;
    }
  };

  const handleOpenCheckout = (tier: PartnerPlanTier) => {
    const tierObj = TIERS.find((t) => t.id === tier);
    setCheckoutDetails({
      planTitle: tierObj?.title || 'Partner Pro',
      amountInr: getTierAmount(tier),
      tierId: tier,
      type: 'partner',
    });
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    upgradePartnerPlan(selectedTier);
    setShowSuccessBadge(true);
    somaticAudio.playStarBeaconChime();
    setTimeout(() => {
      setShowSuccessBadge(false);
      onClose();
    }, 2000);
  };

  const TIERS = [
    {
      id: 'partner_pro_monthly' as PartnerPlanTier,
      title: 'Partner Pro Monthly',
      price: '₹299',
      period: '/ month',
      badge: 'Flexible',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      description: 'Ideal for couples exploring mindful growth and intentional date rhythms.',
      popular: false,
    },
    {
      id: 'partner_pro_annual' as PartnerPlanTier,
      title: 'Partner Pro Annual',
      price: '₹1,999',
      period: '/ year',
      subtext: '₹166 / month • Save 44%',
      badge: 'Most Popular ❤️',
      badgeColor: 'bg-rose-500 text-white border-rose-600',
      description: 'Our most cherished tier. 2 months free plus full priority voice cadence.',
      popular: true,
    },
    {
      id: 'partner_lifetime' as PartnerPlanTier,
      title: 'Sacred Lifetime Pass',
      price: '₹4,999',
      period: 'one-time',
      subtext: 'Perpetual Sanctuary',
      badge: 'Forever',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'One payment for two souls. All current and future Partner features forever.',
      popular: false,
    },
  ];

  const FEATURES = [
    { label: 'Preeti AI Voice Companion', desc: 'Unlimited empathetic relationship reflections & voice narration' },
    { label: 'Somatic Nature Soundscapes', desc: 'Monsoon Rain, 432Hz Bells, Forest Wind, and Grounding Drone' },
    { label: 'NVC Compassionate Re-framer', desc: 'Turn unfiltered impulsive frustrations into gentle connection requests' },
    { label: 'Romantic Date & Hangout Studio', desc: 'Curated date ideas, bucket list, and soulful love letter generator' },
    { label: 'Sacred Milestone Timeline & Dual Journal', desc: 'End-to-end encrypted shared diary plus strictly private secret notes' },
    { label: '5 Love Languages Radar', desc: 'Dynamic alignment radar comparing touch, words, time, acts & gifts' },
    { label: 'DPDP Act §9 Sovereign Privacy', desc: '100% On-device encryption. Completely isolated from Teens & Parents' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md font-sans">
        
        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[92vh] text-left"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-rose-900 via-pink-900 to-amber-950 text-white flex items-center justify-between border-b border-rose-800 relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-rose-300 border border-white/20 shadow-md">
                <Crown size={24} className="text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    PRERNA Partner Pro ❤️
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-200 border border-rose-400/30">
                    Sacred Relationship Sanctuary
                  </span>
                </div>
                <p className="text-xs text-rose-200/90 mt-0.5">
                  Deepen emotional safety, mindful communication, and shared lifetime dreams for two souls
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="relative z-10 p-2 rounded-xl text-rose-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Current Status Strip */}
          <div className="px-6 py-3 bg-rose-50/70 border-b border-rose-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Current Status:</span>
              {partnerPlan === 'trial' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  ⏳ 7-Day Sacred Trial ({partnerTrialDaysRemaining} days remaining)
                </span>
              ) : partnerPlan === 'partner_lifetime' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                  ✨ Sacred Lifetime Pass Active (Perpetual)
                </span>
              ) : partnerPlan === 'partner_pro_monthly' || partnerPlan === 'partner_pro_annual' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                  ✓ Partner Pro Active (Expires: {partnerExpiresAt ? new Date(partnerExpiresAt).toLocaleDateString() : 'Active'})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold">
                  Free Explorer Tier
                </span>
              )}
            </div>

            <span className="text-[11px] text-rose-700 font-medium">
              Cross-subsidizes 100% Free Teen & Parent Guidance
            </span>
          </div>

          {/* Main Body */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Success Overlay when activated */}
            {showSuccessBadge && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center justify-center gap-2 font-bold animate-pulse">
                <Sparkles size={18} className="text-emerald-600" />
                <span>Partner Pro Successfully Activated! Welcoming your relationship to deeper intimacy...</span>
              </div>
            )}

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => {
                      somaticAudio.playSoftChime();
                      setSelectedTier(tier.id);
                    }}
                    className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/40 shadow-lg scale-102 ring-2 ring-rose-400/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-3 right-6 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm">
                        Most Popular ❤️
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{tier.title}</span>
                        {!tier.popular && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                            {tier.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">{tier.price}</span>
                        <span className="text-xs text-slate-500 font-medium">{tier.period}</span>
                      </div>

                      {tier.subtext && (
                        <p className="text-[11px] font-bold text-rose-600 leading-tight">
                          {tier.subtext}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 leading-snug pt-1">
                        {tier.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-900">
                        {isSelected ? '✓ Selected' : 'Select Plan'}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Everything Included in PRERNA Partner Pro:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {FEATURES.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{feat.label}</span>
                      <span className="text-slate-500 text-[11px] leading-tight">{feat.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DPDP Act Sovereignty Notice */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <ShieldCheck size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-0.5">
                <span className="font-bold block">100% Cryptographic Isolation & Zero-Knowledge Security</span>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Your relationship memories, love letters, and private journals never touch cloud servers. PRERNA for Partners is completely invisible to Teens, Parents, and Schools.
                </p>
              </div>
            </div>

          </div>

          {/* Footer Bar & Checkout Button */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Developer Fast-Testing Controls */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="font-bold uppercase tracking-wider text-slate-400">Test Sim:</span>
              <button
                type="button"
                onClick={() => upgradePartnerPlan('trial')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-300 font-semibold cursor-pointer"
              >
                Trial
              </button>
              <button
                type="button"
                onClick={() => upgradePartnerPlan('partner_pro_monthly')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-300 font-semibold cursor-pointer"
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => upgradePartnerPlan('partner_lifetime')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-300 font-semibold cursor-pointer"
              >
                Lifetime
              </button>
              <button
                type="button"
                onClick={() => cancelPartnerPlan()}
                className="px-2 py-0.5 rounded bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold cursor-pointer"
              >
                Free
              </button>
            </div>

            {/* Subscribe Action Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleOpenCheckout(selectedTier)}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-black text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode size={15} />
                <span>Activate {TIERS.find((t) => t.id === selectedTier)?.title} (UPI / Cards)</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

        </motion.div>

        {/* Real Indian Payment Gateway Checkout Modal */}
        <PaymentCheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          details={checkoutDetails}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </AnimatePresence>
  );
};
