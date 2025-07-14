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
  highlightedClub?: string | null;
};

export function ClickableYAxisTick({ x, y, payload, clubs, onEdit, highlightedClub }: ClickableYAxisTickProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const clubName = payload.value;
  const club = clubs.find((c: ClubData) => c.Club === clubName);
  const isHighlighted = highlightedClub === clubName;

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
              color: isHighlighted ? '#ffff00' : '#fff',
              fontWeight: isHighlighted ? 700 : 600,
              textDecoration: 'underline',
              borderBottom: '1px dotted #9ca3af',
              cursor: 'pointer',
              position: 'relative',
              fontSize: isHighlighted ? 16 : 14,
              lineHeight: '28px',
              width: '100%',
              pointerEvents: 'auto',
              backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 0.2)' : 'transparent',
              padding: isHighlighted ? '2px 4px' : '0',
              borderRadius: isHighlighted ? '4px' : '0',
              border: isHighlighted ? '2px solid #ffff00' : 'none',
            }}
            onClick={() => {
              if (club) onEdit(club);
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onTouchStart={() => setHovered(true)}
            onTouchEnd={() => setHovered(false)}
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