import React from 'react';
import { motion } from 'framer-motion';

interface RadarDataPoint {
  label: string;
  value: number; // 0 to 100
}

interface RadarChartProps {
  data: RadarDataPoint[];
  color: string; // Tailwind color class prefix e.g., 'violet' or 'emerald'
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, color, size = 300 }) => {
  const numPoints = data.length;
  const radius = size / 2.5;
  const center = size / 2;
  const angleStep = (Math.PI * 2) / numPoints;

  // Generate SVG coordinates
  const getCoordinatesForValue = (value: number, index: number) => {
    const r = (value / 100) * radius;
    // - Math.PI / 2 starts the first point at the top (12 o'clock)
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Build the polygon path string
  const points = data.map((d, i) => {
    const coords = getCoordinatesForValue(d.value, i);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  // Base background polygons (web grid)
  const webLevels = [20, 40, 60, 80, 100];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 overflow-visible">
        
        {/* Draw the web levels */}
        {webLevels.map((level) => {
          const levelPoints = data.map((_, i) => {
            const coords = getCoordinatesForValue(level, i);
            return `${coords.x},${coords.y}`;
          }).join(' ');
          return (
            <polygon 
              key={`web-${level}`}
              points={levelPoints}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Draw axes from center */}
        {data.map((_, i) => {
          const coords = getCoordinatesForValue(100, i);
          return (
            <line 
              key={`axis-${i}`}
              x1={center} y1={center}
              x2={coords.x} y2={coords.y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* The Animated Data Polygon */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.5, originX: '50%', originY: '50%' }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          points={points}
          className={`fill-${color}-500/30 stroke-${color}-400`}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* The Data Points (Dots) */}
        {data.map((d, i) => {
          const coords = getCoordinatesForValue(d.value, i);
          return (
            <motion.circle
              key={`dot-${i}`}
              initial={{ opacity: 0, r: 0 }}
              animate={{ opacity: 1, r: 4 }}
              transition={{ delay: 0.5 + (i * 0.1), type: "spring" }}
              cx={coords.x}
              cy={coords.y}
              className={`fill-white stroke-${color}-500`}
              strokeWidth="2"
            />
          );
        })}
      </svg>
      
      {/* HTML Labels overlay */}
      {data.map((d, i) => {
         const coords = getCoordinatesForValue(115, i); // Push labels slightly outside
         return (
           <div 
             key={`label-${i}`}
             className="absolute transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white/70 uppercase tracking-widest whitespace-nowrap text-center"
             style={{ left: coords.x, top: coords.y }}
           >
             {d.label}
             <div className={`text-${color}-400 font-black text-sm`}>{Math.round(d.value)}</div>
           </div>
         )
      })}
    </div>
  );
};
