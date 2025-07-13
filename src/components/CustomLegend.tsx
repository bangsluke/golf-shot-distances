export function CustomLegend() {
  const items = [
    { color: 'bg-green-500', label: 'Average Total Distance Hit (Yards)' },
    { color: 'bg-blue-400', label: 'Average Flat Carry (Yards)' },
    { color: 'bg-blue-600', label: 'Carry (Yards)' },
    { color: 'bg-red-500', label: 'Overhit Risk (Yards)' },
  ];
  return (
    <div className="flex justify-center pb-4">
      <div className="border border-white bg-white/10 rounded-lg px-6 py-4 min-w-[260px]">
        <div className="text-xs font-bold uppercase tracking-wide text-white mb-3 text-center">Legend</div>
        <div className="flex flex-wrap justify-center gap-3">
          {items.map(item => (
            <span
              key={item.label}
              className={`flex items-center gap-2 px-8 py-3 rounded-full ${item.color} text-white text-xs font-medium shadow-sm border border-gray-300 transition-colors duration-200 cursor-default hover:brightness-110`}
              style={{ minWidth: 0 }}
            >
              <span className={`inline-block w-4 h-4 rounded-full bg-white/30 border border-white`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 