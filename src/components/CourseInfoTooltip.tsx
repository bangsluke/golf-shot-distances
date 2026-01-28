import { useEffect, useState } from 'react';
import { SharedTooltip } from './SharedTooltip';

const COURSE_CONDITION_INFO = [
  { label: 'Normal conditions', desc: 'No adjustment to roll distance.' },
  { label: 'Dry conditions', desc: 'Increase roll by 50%.' },
  { label: 'Very dry conditions', desc: 'Increase roll by 100%.' },
  { label: 'Wet conditions', desc: 'Decrease roll by 50%.' },
  { label: 'Very wet conditions', desc: 'Decrease roll by 100% (roll is 0).' },
];

interface CourseInfoTooltipProps {
  anchorRef?: React.RefObject<HTMLElement>;
}

export function CourseInfoTooltip({ anchorRef }: CourseInfoTooltipProps) {
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
      <div className="font-bold mb-2">Course conditions:</div>
      <ul className="list-disc pl-4 space-y-1">
        {COURSE_CONDITION_INFO.map(item => (
          <li key={item.label}><span className="font-semibold">{item.label}:</span> {item.desc}</li>
        ))}
      </ul>
    </SharedTooltip>
  );
} 