import React from 'react';

interface SharedTooltipProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  show?: boolean;
  style?: React.CSSProperties;
}

export function SharedTooltip({ 
  children, 
  className = '', 
  position = 'top',
  show = true,
  style = {}
}: SharedTooltipProps) {
  if (!show) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className={`
      absolute ${positionClasses[position]}
      custom-tooltip bg-gray-900 text-white text-xs rounded-lg shadow-lg p-4 z-50 border border-gray-700
      ${className}
    `} style={style}>
      {children}
    </div>
  );
} 