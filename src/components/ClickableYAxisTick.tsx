import type { ClubData } from './ClubEditModal';

type ClickableYAxisTickProps = {
  x: number;
  y: number;
  payload: { value: string };
  clubs: ClubData[];
  onEdit: (club: ClubData) => void;
};

export function ClickableYAxisTick({ x, y, payload, clubs, onEdit }: ClickableYAxisTickProps) {
  const clubName = payload.value;
  const club = clubs.find((c: ClubData) => c.Club === clubName);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#fff"
        className="cursor-pointer underline hover:text-blue-400 transition-colors"
        style={{ fontWeight: 600 }}
        onClick={() => club && onEdit(club)}
      >
        {clubName}
      </text>
    </g>
  );
} 