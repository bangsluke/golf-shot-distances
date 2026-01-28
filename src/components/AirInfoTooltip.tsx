import { useEffect, useState } from 'react';
import { SharedTooltip } from './SharedTooltip';

const AIR_CONDITION_INFO = [
  { label: 'Normal conditions', desc: 'No adjustment to values.' },
  { label: 'Rainy conditions', desc: 'Reduce average flat carry by 10%.' },
  { label: 'Windy conditions', desc: 'Increase overhit risk by 20%.' },
];

interface AirInfoTooltipProps {
  anchorRef?: React.RefObject<HTMLElement>;
}

export function AirInfoTooltip({ anchorRef }: AirInfoTooltipProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isMobile || !anchorRef?.current) return;
    const el = anchorRef.current;
    const update = () => setAnchorRect(el.getBoundingClientRect());
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isMobile, anchorRef]);

  return (
    <SharedTooltip className="" position="bottom" viewportSafe={isMobile} anchorRect={anchorRect} style={{ width: isMobile ? '280px' : '350px' }}>
      <div className="font-bold mb-2">Air conditions:</div>
      <ul className="list-disc pl-4 space-y-1">
        {AIR_CONDITION_INFO.map(item => (
          <li key={item.label}><span className="font-semibold">{item.label}:</span> {item.desc}</li>
        ))}
      </ul>
    </SharedTooltip>
  );
} 