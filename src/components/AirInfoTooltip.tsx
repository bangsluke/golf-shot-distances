import React from 'react';

const AIR_CONDITION_INFO = [
  { label: 'Normal conditions', desc: 'No adjustment to values.' },
  { label: 'Rainy conditions', desc: 'Reduce average flat carry by 10%.' },
  { label: 'Windy conditions', desc: 'Increase overhit risk by 20%.' },
];

export function AirInfoTooltip() {
  return (
    <div className="custom-tooltip absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-4 z-50 border border-gray-700">
      <div className="font-bold mb-2">Air conditions:</div>
      <ul className="list-disc pl-4 space-y-1">
        {AIR_CONDITION_INFO.map(item => (
          <li key={item.label}><span className="font-semibold">{item.label}:</span> {item.desc}</li>
        ))}
      </ul>
    </div>
  );
} 