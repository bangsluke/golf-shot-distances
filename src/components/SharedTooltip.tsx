import React from 'react';

const TOOLTIP_PADDING = 16;
const MOBILE_TOOLTIP_WIDTH = 280;

interface SharedTooltipProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  show?: boolean;
  style?: React.CSSProperties;
  /** On mobile, position relative to trigger and clamp to viewport */
  viewportSafe?: boolean;
  /** Trigger rect when viewportSafe – tooltip is positioned below and clamped to viewport */
  anchorRect?: DOMRect | null;
}

export function SharedTooltip({ 
  children, 
  className = '', 
  position = 'top',
  show = true,
  style = {},
  viewportSafe = false,
  anchorRect = null
}: SharedTooltipProps) {
  if (!show) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const useAnchorPosition = viewportSafe && anchorRect;
  const fixedStyle: React.CSSProperties = useAnchorPosition ? (() => {
    const gap = 8;
    const w = Math.min(MOBILE_TOOLTIP_WIDTH, window.innerWidth - TOOLTIP_PADDING * 2);
    const centerX = anchorRect.left + anchorRect.width / 2;
    const left = Math.max(TOOLTIP_PADDING, Math.min(centerX - w / 2, window.innerWidth - w - TOOLTIP_PADDING));
    let top = anchorRect.bottom + gap;
    let maxHeight = window.innerHeight - top - TOOLTIP_PADDING;
    if (maxHeight < 100) {
      top = TOOLTIP_PADDING;
      maxHeight = anchorRect.top - gap - TOOLTIP_PADDING;
    } else {
      maxHeight = window.innerHeight - top - TOOLTIP_PADDING;
    }
    return {
      position: 'fixed' as const,
      left,
      top,
      width: w,
      maxHeight,
      overflowY: 'auto' as const
    };
  })() : {};

  return (
    <div className={`
      ${useAnchorPosition ? '' : `absolute ${positionClasses[position]}`}
      custom-tooltip bg-gray-800 text-white text-xs rounded-lg shadow-lg p-4 z-50 border border-gray-600
      ${className}
    `} style={useAnchorPosition ? { ...style, ...fixedStyle } : style}>
      {children}
    </div>
  );
} 