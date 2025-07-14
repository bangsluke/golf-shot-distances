import { useState } from 'react';
import { SharedTooltip } from './SharedTooltip';

export function CustomLegend() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const isMobile = window.innerWidth < 768;
  const items = [
    { 
      color: '#22c55e', 
      label: 'Average Total Distance Hit (Yards)',
      tooltip: 'The average distance hit with each club taken over several shots including the flat carry and ball roll'
    },
    { 
      color: '#60a5fa', 
      label: 'Average Flat Carry (Yards)',
      tooltip: 'A calculated carry distance, assuming a flat landing surface. This is useful for comparing your shots to your potential, as it removes the variable of the terrain.'
    },
    { 
      color: '#3b82f6', 
      label: 'Average Roll (Yards)',
      tooltip: 'The average roll is the distance between your average flat carry and total distance hit'
    },
    { 
      color: '#ef4444', 
      label: 'Overhit Risk (Yards)',
      tooltip: 'The possible extra distance over your average shot distance you are capable of making'
    },
  ];
  return (
    <div className="flex justify-center pb-1 sm:pb-2 md:pb-4">
      <div className={`border border-gray-600 bg-gray-800 rounded-lg px-2 sm:px-3 md:px-6 py-1 sm:py-2 md:py-4 ${isMobile ? 'min-w-[180px]' : 'min-w-[260px]'}`}>
        <div className="text-xs font-bold uppercase tracking-wide text-white mb-1 sm:mb-2 md:mb-3 text-center">Legend</div>
        <div className={`flex flex-wrap justify-center ${isMobile ? 'gap-1' : 'gap-3'}`}>
          {items.map(item => (
            <div key={item.label} className="relative">
              <span
                className={`flex items-center gap-1 sm:gap-2 px-1 sm:px-2 md:px-3 py-1 sm:py-1 md:py-2 rounded-full text-white font-medium shadow-sm border border-gray-300 transition-colors duration-200 cursor-help hover:brightness-110`}
                style={{ 
                  minWidth: 0, 
                  backgroundColor: `${item.color}`, 
                  fontSize: isMobile ? '0.55rem' : '0.7rem'
                }}
                onMouseEnter={() => setActiveTooltip(item.label)}
                onMouseLeave={() => setActiveTooltip(null)}
                onFocus={() => setActiveTooltip(item.label)}
                onBlur={() => setActiveTooltip(null)}
                onTouchStart={() => setActiveTooltip(item.label)}
                onTouchEnd={() => setActiveTooltip(null)}
              >
                <span style={{ borderBottom: '1px dotted #9ca3af' }}>
                  {item.label}
                </span>
              </span>
              {activeTooltip === item.label && (
                <SharedTooltip position="top" style={{ width: isMobile ? '250px' : '300px' }}>
                  <div className="font-bold mb-2">{item.label}</div>
                  <div className="text-sm">{item.tooltip}</div>
                </SharedTooltip>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 