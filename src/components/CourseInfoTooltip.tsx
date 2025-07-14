
import { SharedTooltip } from './SharedTooltip';

const COURSE_CONDITION_INFO = [
  { label: 'Normal conditions', desc: 'No adjustment to roll distance.' },
  { label: 'Dry conditions', desc: 'Increase roll by 50%.' },
  { label: 'Very dry conditions', desc: 'Increase roll by 100%.' },
  { label: 'Wet conditions', desc: 'Decrease roll by 50%.' },
  { label: 'Very wet conditions', desc: 'Decrease roll by 100% (roll is 0).' },
];

export function CourseInfoTooltip() {
  const isMobile = window.innerWidth < 768;
  
  return (
    <SharedTooltip className="" position="bottom" style={{ width: isMobile ? '280px' : '350px' }}>
      <div className="font-bold mb-2">Course conditions:</div>
      <ul className="list-disc pl-4 space-y-1">
        {COURSE_CONDITION_INFO.map(item => (
          <li key={item.label}><span className="font-semibold">{item.label}:</span> {item.desc}</li>
        ))}
      </ul>
    </SharedTooltip>
  );
} 