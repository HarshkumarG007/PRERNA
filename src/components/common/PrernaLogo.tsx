import React from 'react';
import { motion } from 'framer-motion';

export type LogoVariant = 'icon' | 'compact' | 'full' | 'badge' | 'watermark';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type LogoTheme = 'default' | 'calm' | 'gold' | 'monochrome';

interface PrernaLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: LogoTheme;
  animate?: boolean;
  showTagline?: boolean;
  showDevanagari?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeMap: Record<LogoSize, { iconSize: number; fontSize: string; subFontSize: string }> = {
  xs: { iconSize: 20, fontSize: 'text-sm font-extrabold', subFontSize: 'text-[9px]' },
  sm: { iconSize: 28, fontSize: 'text-lg font-black', subFontSize: 'text-[10px]' },
  md: { iconSize: 40, fontSize: 'text-2xl font-black', subFontSize: 'text-xs' },
  lg: { iconSize: 56, fontSize: 'text-3xl font-black', subFontSize: 'text-sm' },
  xl: { iconSize: 84, fontSize: 'text-5xl font-black', subFontSize: 'text-base' },
  '2xl': { iconSize: 120, fontSize: 'text-6xl font-black', subFontSize: 'text-lg' },
};

/**
 * PrernaEmblem: Core Vector Brand Emblem
 * Represents the 4 pillars of adolescent guidance:
 * - The Inner Spark/Diya (Inspiration & clarity)
 * - The Guiding Compass (Dhruva Tara / trajectory)
 * - The Lotus Growth Wings (Resilience & self-unfolding)
 * - The Sanctuary Orbit (DPDP Act local-first privacy shield)
 */
export const PrernaEmblem: React.FC<{
  size?: number;
  animate?: boolean;
  theme?: LogoTheme;
  className?: string;
}> = ({ size = 40, animate = false, theme = 'default', className = '' }) => {
  const gradientId = React.useId();

  const getGradientStops = () => {
    switch (theme) {
      case 'calm':
        return (
          <>
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#34D399" />
          </>
        );
      case 'gold':
        return (
          <>
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EA580C" />
          </>
        );
      case 'monochrome':
        return (
          <>
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#94A3B8" />
          </>
        );
      case 'default':
      default:
        return (
          <>
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="35%" stopColor="#A855F7" />
            <stop offset="70%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F43F5E" />
          </>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient Breathing Glow */}
      {animate && (
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{
            background:
              theme === 'calm'
                ? 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(244,63,94,0.15) 70%, transparent 100%)',
          }}
        />
      )}

      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 select-none overflow-visible"
      >
        <defs>
          <linearGradient id={`grad-${gradientId}`} x1="15%" y1="10%" x2="85%" y2="90%">
            {getGradientStops()}
          </linearGradient>

          <linearGradient id={`spark-${gradientId}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="85%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id={`calmRing-${gradientId}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
          </linearGradient>

          <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Sanctuary Orbit (Local-First Shield) */}
        <motion.circle
          cx="256"
          cy="256"
          r="215"
          stroke={`url(#calmRing-${gradientId})`}
          strokeWidth="3"
          strokeOpacity="0.3"
          animate={animate ? { rotate: [0, 360] } : undefined}
          transition={animate ? { duration: 40, repeat: Infinity, ease: 'linear' } : undefined}
          style={{ transformOrigin: 'center' }}
        />
        <circle
          cx="256"
          cy="256"
          r="195"
          stroke={`url(#grad-${gradientId})`}
          strokeWidth="4"
          strokeOpacity="0.4"
          strokeDasharray="10 12"
        />

        {/* Cardinal Anchors (Privacy, Self-Discovery, Wellbeing, Agency) */}
        <circle cx="256" cy="41" r="7" fill="#818CF8" />
        <circle cx="471" cy="256" r="7" fill="#EC4899" />
        <circle cx="256" cy="471" r="7" fill="#F43F5E" />
        <circle cx="41" cy="256" r="7" fill="#06B6D4" />

        {/* Lotus Guidance Wings (Ascending Growth & Resilience) */}
        <g>
          {/* Left Wing */}
          <path
            d="M256 380 C210 380 135 340 115 250 C100 180 145 130 195 145 C230 155 245 195 256 230 C242 190 220 170 195 168 C160 165 130 200 138 255 C150 320 215 350 256 355 Z"
            fill={`url(#grad-${gradientId})`}
            opacity="0.95"
          />

          {/* Right Wing (Mirrored) */}
          <path
            d="M256 380 C302 380 377 340 397 250 C412 180 367 130 317 145 C282 155 267 195 256 230 C270 190 292 170 317 168 C352 165 382 200 374 255 C362 320 297 350 256 355 Z"
            fill={`url(#grad-${gradientId})`}
            opacity="0.95"
          />

          {/* Calming Lower Cradle */}
          <path
            d="M190 320 C225 365 287 365 322 320 C340 345 315 390 256 395 C197 390 172 345 190 320 Z"
            fill={`url(#grad-${gradientId})`}
            opacity="0.75"
          />
        </g>

        {/* Central North Star / Compass Rays */}
        <g filter={`url(#glow-${gradientId})`}>
          {/* Vertical Trajectory Spire */}
          <path d="M256 95 L263 235 L256 256 L249 235 Z" fill={`url(#spark-${gradientId})`} />
          <path d="M256 415 L263 277 L256 256 L249 277 Z" fill={`url(#grad-${gradientId})`} opacity="0.8" />

          {/* Horizontal Equilibrium */}
          <path d="M95 256 L235 249 L256 256 L235 263 Z" fill={`url(#grad-${gradientId})`} opacity="0.85" />
          <path d="M415 256 L277 249 L256 256 L277 263 Z" fill={`url(#grad-${gradientId})`} opacity="0.85" />

          {/* Inner Flame Spark (Diya of Inspiration) */}
          <path
            d="M256 165 C268 205 284 235 284 260 C284 275 271 288 256 288 C241 288 228 275 228 260 C228 235 244 205 256 165 Z"
            fill={`url(#spark-${gradientId})`}
          />

          {/* Core Bindu & Luminous Center */}
          <circle cx="256" cy="256" r="9" fill="#FFFFFF" />
          <circle cx="256" cy="256" r="4.5" fill="#FDE047" />
        </g>
      </svg>
    </div>
  );
};

/**
 * PrernaLogo: Full Responsive Brand Component with Typography & Philosophy
 */
export const PrernaLogo: React.FC<PrernaLogoProps> = ({
  variant = 'compact',
  size = 'md',
  theme = 'default',
  animate = true,
  showTagline = true,
  showDevanagari = true,
  className = '',
  onClick,
}) => {
  const { iconSize, fontSize, subFontSize } = sizeMap[size];

  if (variant === 'icon') {
    return (
      <div onClick={onClick} className={`cursor-pointer inline-flex items-center ${className}`}>
        <PrernaEmblem size={iconSize} animate={animate} theme={theme} />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-lg shadow-purple-500/10 hover:border-purple-500/30 transition-all ${className}`}
      >
        <PrernaEmblem size={iconSize} animate={animate} theme={theme} />
        <div className="flex flex-col">
          <span className={`tracking-widest bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent ${fontSize}`}>
            PRERNA
          </span>
          {showDevanagari && (
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
              प्रेरणा • Inspiration
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'watermark') {
    return (
      <div className={`pointer-events-none select-none absolute overflow-hidden ${className}`}>
        <PrernaEmblem size={iconSize * 3.5} animate={false} theme="monochrome" className="opacity-[0.035]" />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center text-center gap-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="p-3.5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/15">
          <PrernaEmblem size={iconSize} animate={animate} theme={theme} />
        </div>

        <div className="flex flex-col items-center">
          <div className="relative inline-flex items-center">
            <h1 className={`tracking-widest font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent ${fontSize}`}>
              PRERNA
            </h1>
          </div>

          {(showDevanagari || showTagline) && (
            <div className={`flex items-center gap-2 mt-1.5 font-bold tracking-widest text-slate-400 ${subFontSize}`}>
              {showDevanagari && <span className="text-violet-300">प्रेरणा</span>}
              {showDevanagari && showTagline && <span className="text-slate-600">•</span>}
              {showTagline && <span className="text-fuchsia-400/90 uppercase tracking-[0.2em]">Inspiration Within</span>}
            </div>
          )}

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Local-First Adolescent Sanctuary</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: 'compact' (Horizontal lockup for Navigation & Headers)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none group transition-transform ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className}`}
    >
      <div className="p-1.5 rounded-2xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 group-hover:border-purple-400/30 transition-colors shadow-sm">
        <PrernaEmblem size={iconSize} animate={animate} theme={theme} />
      </div>

      <div className="flex flex-col justify-center">
        <span className={`tracking-wider leading-none bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-rose-300 transition-all ${fontSize}`}>
          PRERNA
        </span>

        {showDevanagari && (
          <span className={`leading-tight tracking-widest font-semibold text-slate-400/80 group-hover:text-slate-300 transition-colors ${subFontSize}`}>
            प्रेरणा • Sanctuary
          </span>
        )}
      </div>
    </div>
  );
};

export default PrernaLogo;
