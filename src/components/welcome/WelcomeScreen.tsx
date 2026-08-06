import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, LogIn, ChevronDown, Star, Heart, Brain } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface WelcomeScreenProps {
  onAuthenticated: (userId: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAuthenticated }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect for background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const openSignup = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  const openLogin = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated Background Layers */}
      <BackgroundEffects mousePosition={mousePosition} />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center justify-between px-6 py-6 md:px-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              PRERNA
            </span>
          </div>
          
          <button
            onClick={openLogin}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <LogIn size={16} />
            Sign In
          </button>
        </motion.nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-12">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-white/80">Trusted by 10,000+ Indian teens</span>
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black leading-tight">
                  <span className="text-white block mb-2">Discover</span>
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    Your True Self
                  </span>
                </h1>
                <p className="text-xl text-white/60 leading-relaxed max-w-lg font-medium">
                  PRERNA combines AI, psychology, and play to reveal your unique strengths, 
                  guide your future, and help you become who you're meant to be.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  onClick={openSignup}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-white shadow-2xl shadow-violet-500/25 overflow-hidden text-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-3">
                    Begin Your Journey
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>

                <motion.button
                  onClick={openLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-2xl font-bold text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-sm text-lg"
                >
                  I have a PIN
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-6">
                <div className="flex items-center gap-3 text-white/50 text-sm font-medium">
                  <div className="flex -space-x-3">
                    {['bg-violet-400', 'bg-fuchsia-400', 'bg-pink-400', 'bg-emerald-400'].map((color, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${color} border-2 border-slate-950 opacity-80`}
                      />
                    ))}
                  </div>
                  <span>Join the community</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                  <ShieldCheck />
                  <span>100% Private & Secure</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square">
                {/* Floating Cards */}
                <FloatingCard
                  delay={0.6}
                  position={{ top: '15%', left: '10%' }}
                  icon={<Brain className="text-violet-400" size={28} />}
                  title="Know Your Mind"
                  subtitle="Personality insights"
                  color="from-violet-500/20 to-purple-500/20"
                />
                
                <FloatingCard
                  delay={0.8}
                  position={{ top: '45%', right: '5%' }}
                  icon={<Heart className="text-pink-400" size={28} />}
                  title="Emotional Wellness"
                  subtitle="Mental health tracking"
                  color="from-pink-500/20 to-rose-500/20"
                />
                
                <FloatingCard
                  delay={1}
                  position={{ bottom: '15%', left: '20%' }}
                  icon={<Star className="text-amber-400" size={28} />}
                  title="Career Path"
                  subtitle="Personalized guidance"
                  color="from-amber-500/20 to-orange-500/20"
                />

                {/* Central Glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl animate-pulse" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs uppercase font-bold tracking-widest">Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onSuccess={onAuthenticated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Background Effects Component
const BackgroundEffects: React.FC<{ mousePosition: { x: number; y: number } }> = ({ 
  mousePosition 
}) => {
  return (
    <>
      {/* Gradient Orbs */}
      <div 
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
          transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Particle Field */}
      <ParticleField />
    </>
  );
};

// Floating Card Component
const FloatingCard: React.FC<{
  delay: number;
  position: { top?: string; left?: string; right?: string; bottom?: string };
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}> = ({ delay, position, icon, title, subtitle, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    style={position}
    className="absolute z-10"
  >
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ repeat: Infinity, duration: 5, delay: delay * 0.5, ease: "easeInOut" }}
      className={`p-5 rounded-3xl bg-gradient-to-br ${color} backdrop-blur-xl border border-white/10 shadow-2xl`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-white font-bold text-lg mb-0.5">{title}</h4>
          <p className="text-white/60 text-sm font-medium">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// Particle Field Animation
const ParticleField: React.FC = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -200, 0],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

const ShieldCheck: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
