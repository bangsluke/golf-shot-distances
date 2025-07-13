import React from 'react';

const COURSE_CONDITION_INFO = [
  { label: 'Normal conditions', desc: 'No adjustment to carry distance.' },
  { label: 'Dry conditions', desc: 'Increase carry by 50%.' },
  { label: 'Very dry conditions', desc: 'Increase carry by 100%.' },
  { label: 'Wet conditions', desc: 'Decrease carry by 50%.' },
  { label: 'Very wet conditions', desc: 'Decrease carry by 100% (carry is 0).' },
];

export function CourseInfoTooltip() {
  return (
    <div className="custom-tooltip absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-4 z-50 border border-gray-700">
      <div className="font-bold mb-2">Course conditions:</div>
      <ul className="list-disc pl-4 space-y-1">
        {COURSE_CONDITION_INFO.map(item => (
          <li key={item.label}><span className="font-semibold">{item.label}:</span> {item.desc}</li>
        ))}
      </ul>
    </div>
  );
} 