
import { SharedTooltip } from './SharedTooltip';

const AIR_CONDITION_INFO = [
  { label: 'Normal conditions', desc: 'No adjustment to values.' },
  { label: 'Rainy conditions', desc: 'Reduce average flat carry by 10%.' },
  { label: 'Windy conditions', desc: 'Increase overhit risk by 20%.' },
];

export function AirInfoTooltip() {
  return (
    <SharedTooltip className="" position="bottom" style={{ width: '350px' }}>
      <div className="font-bold mb-2">Air conditions:</div>
      <ul className="list-disc pl-4 space-y-1">
        {AIR_CONDITION_INFO.map(item => (
          <li key={item.label}><span className="font-semibold">{item.label}:</span> {item.desc}</li>
        ))}
      </ul>
    </SharedTooltip>
  );
} 