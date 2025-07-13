export function CustomLegend() {
  const items = [
    { color: '#22c55e', label: 'Average Total Distance Hit (Yards)' },
    { color: '#60a5fa', label: 'Average Flat Carry (Yards)' },
    { color: '#3b82f6', label: 'Carry (Yards)' },
    { color: '#ef4444', label: 'Overhit Risk (Yards)' },
  ];
  return (
    <div className="flex justify-center pb-4">
      <div className="border border-white bg-white/10 rounded-lg px-6 py-4 min-w-[260px]" style={{ padding: '8px' }}>
        <div className="text-xs font-bold uppercase tracking-wide text-white mb-3 text-center">Legend</div>
        <div className="flex flex-wrap justify-center" style={{ gap: '12px' }}>
          {items.map(item => (
            <span
              key={item.label}
              className={`flex items-center gap-2 px-12 py-4 rounded-full text-white font-medium shadow-sm border border-gray-300 transition-colors duration-200 cursor-default hover:brightness-110`}
              style={{ minWidth: 0, padding: '8px', backgroundColor: `${item.color}`, fontSize: '0.7rem' }}
            >
              {/* <span className={`inline-block w-4 h-4 rounded-full bg-white/30 border border-white`} /> */}
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 