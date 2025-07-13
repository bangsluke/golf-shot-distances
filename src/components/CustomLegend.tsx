export function CustomLegend() {
  const items = [
    { color: 'bg-green-500', hover: 'hover:bg-green-500', text: 'hover:text-white', label: 'Average Total Distance Hit (Yards)' },
    { color: 'bg-blue-400', hover: 'hover:bg-blue-400', text: 'hover:text-white', label: 'Average Flat Carry (Yards)' },
    { color: 'bg-blue-600', hover: 'hover:bg-blue-600', text: 'hover:text-white', label: 'Carry (Yards)' },
    { color: 'bg-red-500', hover: 'hover:bg-red-500', text: 'hover:text-white', label: 'Overhit Risk (Yards)' },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-3 pb-4">
      {items.map(item => (
        <span
          key={item.label}
          className={`flex items-center gap-2 px-5 py-2 rounded-full bg-gray-200/80 text-gray-900 text-xs font-medium shadow-sm border border-gray-300 transition-colors duration-200 cursor-default ${item.hover} ${item.text}`}
        >
          <span className={`inline-block w-3 h-3 rounded-full ${item.color} border border-white`} />
          {item.label}
        </span>
      ))}
    </div>
  );
} 