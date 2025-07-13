import type { ClubData } from './ClubEditModal';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SharedTooltip } from './SharedTooltip';

type ClickableYAxisTickProps = {
  x: number;
  y: number;
  payload: { value: string };
  clubs: ClubData[];
  onEdit: (club: ClubData) => void;
};

export function ClickableYAxisTick({ x, y, payload, clubs, onEdit }: ClickableYAxisTickProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const clubName = payload.value;
  const club = clubs.find((c: ClubData) => c.Club === clubName);

  useEffect(() => {
    if (hovered) {
      // Calculate position relative to viewport
      const chartElement = document.querySelector('.recharts-wrapper');
      if (chartElement) {
        const rect = chartElement.getBoundingClientRect();
        setTooltipPosition({
          x: rect.left + x - 120, // Position to the left of the label
          y: rect.top + y - 14
        });
      }
    }
  }, [hovered, x, y]);

  return (
    <>
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-120} y={-14} width={120} height={28} style={{ overflow: 'visible' }}>
          <span
            style={{
              display: 'block',
              textAlign: 'right',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
              position: 'relative',
              fontSize: 14,
              lineHeight: '28px',
              width: '100%',
              pointerEvents: 'auto',
            }}
            onClick={() => {
              if (club) onEdit(club);
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {clubName}
          </span>
        </foreignObject>
      </g>
      {hovered && createPortal(
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            zIndex: 999999,
            pointerEvents: 'none'
          }}
        >
          <SharedTooltip show={true} position="right" className="whitespace-nowrap">
            Edit club values
          </SharedTooltip>
        </div>,
        document.body
      )}
    </>
  );
} 