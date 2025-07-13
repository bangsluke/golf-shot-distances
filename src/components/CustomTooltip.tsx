import type { ClubData } from './ClubEditModal';

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ClubData }[];
  distanceFields: string[];
  lineField: string;
}

export function CustomTooltip({ active, payload, distanceFields, lineField }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const club = payload[0].payload;
    return (
      <div className="custom-tooltip bg-gray-900 text-white text-xs rounded-lg shadow-lg p-4 z-50 border border-gray-700">
        <div className="font-bold mb-2">{club['Club']}</div>
        {[...distanceFields, lineField, 'Max Flat Carry (Yards)', 'Max Total Distance Hit (Yards)'].map(field => (
          <div key={field} className="text-sm"><span className="font-medium">{field}:</span> {club[field]}</div>
        ))}
        <div className="text-xs text-gray-400 mt-2">{club['Comments']}</div>
      </div>
    );
  }
  return null;
} 