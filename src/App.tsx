import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Line, CartesianGrid
} from 'recharts';
import { HiInformationCircle } from 'react-icons/hi';
import { ClubEditModal } from './components/ClubEditModal';
import type { ClubData } from './components/ClubEditModal';
import { CustomTooltip } from './components/CustomTooltip';
import { ClickableYAxisTick } from './components/ClickableYAxisTick';
import { CustomLegend } from './components/CustomLegend';
import { CourseInfoTooltip } from './components/CourseInfoTooltip';
import { AirInfoTooltip } from './components/AirInfoTooltip';
import { ApiDebugger } from './components/ApiDebugger';
import './index.css';

// Use Netlify function URL in production, localhost in development
const API_URL = import.meta.env.PROD 
  ? '/api/clubs' 
  : 'http://localhost:4000/api/clubs';

const BAR_COLORS = {
  'Average Flat Carry (Yards)': '#60a5fa', // blue-400
  'Carry (Yards)': '#3b82f6', // blue-600
  'Overhit Risk (Yards)': '#ef4444', // red-500
};

const LINE_COLOR = '#22c55e'; // green-500

const DISTANCE_FIELDS = [
  'Average Flat Carry (Yards)',
  'Carry (Yards)',
  'Overhit Risk (Yards)'
] as const;

const LINE_FIELD = 'Average Total Distance Hit (Yards)';

const COURSE_CONDITIONS = [
  { label: 'Normal conditions', value: 'normal', factor: 1 },
  { label: 'Dry conditions', value: 'dry', factor: 1.5 },
  { label: 'Very dry conditions', value: 'verydry', factor: 2 },
  { label: 'Wet conditions', value: 'wet', factor: 0.5 },
  { label: 'Very wet conditions', value: 'verywet', factor: 0 },
];

const AIR_CONDITIONS = [
  { label: 'Normal conditions', value: 'normal' },
  { label: 'Rainy conditions', value: 'rainy' },
  { label: 'Windy conditions', value: 'windy' },
];

function App() {
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editClub, setEditClub] = useState<ClubData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [courseCondition, setCourseCondition] = useState('normal');
  const [airCondition, setAirCondition] = useState('normal');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAirTooltip, setShowAirTooltip] = useState(false);
  const [distanceToHole, setDistanceToHole] = useState('');
  const [recommendedClub, setRecommendedClub] = useState<{
    club: string;
    distance: number;
    difference: number;
  } | null>(null);
  const [highlightedClub, setHighlightedClub] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setClubs(res.data);
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
      // Set empty array to prevent crashes, but you might want to show an error message
      setClubs([]);
      // You could add a state for error handling here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);



  const handleEdit = (club: ClubData) => {
    setEditClub(club);
    setModalOpen(true);
  };

  const handleSave = async (updated: ClubData) => {
    try {
      await axios.put(`${API_URL}/${encodeURIComponent(updated['Club'])}`, updated);
      setModalOpen(false);
      setEditClub(null);
      fetchClubs();
    } catch (error) {
      console.error('Failed to update club:', error);
      // You could add error handling here (show error message to user)
      // For now, we'll just log the error
    }
  };

  const chartHeight = 500;
  const yAxisTopMargin = 30; // matches chart margin.top
  const yAxisBottomMargin = 30; // matches chart margin.bottom

  // Compute carry factor and label for course conditions
  const carryFactor = COURSE_CONDITIONS.find(c => c.value === courseCondition)?.factor ?? 1;
  let carryLabel = '';
  if (carryFactor === 1) carryLabel = 'Carry ±0%';
  else if (carryFactor > 1) carryLabel = `Carry +${Math.round((carryFactor - 1) * 100)}%`;
  else carryLabel = `Carry ${Math.round((carryFactor - 1) * 100)}%`;
  const carryLabelColor = carryFactor > 1 ? '#22c55e' : carryFactor < 1 ? '#ef4444' : '#9ca3af';

  // Compute air condition factor and label
  let airLabel = '';
  let airLabelColor = '#9ca3af';
  if (airCondition === 'rainy') {
    airLabel = 'Avg Flat Carry -10%';
    airLabelColor = '#ef4444';
  } else if (airCondition === 'windy') {
    airLabel = 'Overhit Risk +20%';
    airLabelColor = '#22c55e';
  } else {
    airLabel = 'No adjustment';
    airLabelColor = '#9ca3af';
  }

  // Calculate Carry and Overhit Risk, then adjust based on conditions
  const chartData = clubs.map(club => {
    try {
      // Parse values, handling empty strings
      const avgTotalDistanceStr = club['Average Total Distance Hit (Yards)'] || '';
      const avgFlatCarryStr = club['Average Flat Carry (Yards)'] || '';
      const maxTotalDistanceStr = club['Max Total Distance Hit (Yards)'] || '';
      
      const avgTotalDistance = avgTotalDistanceStr ? parseFloat(avgTotalDistanceStr) : 0;
      const avgFlatCarryRaw = avgFlatCarryStr ? parseFloat(avgFlatCarryStr) : 0;
      const maxTotalDistance = maxTotalDistanceStr ? parseFloat(maxTotalDistanceStr) : 0;
      
      // Only calculate if we have valid data
      let carry = 0;
      let overhitRisk = 0;
      let avgFlatCarry = avgFlatCarryRaw;
      
      if (avgTotalDistance > 0 && avgFlatCarryRaw > 0) {
        carry = (avgTotalDistance - avgFlatCarryRaw) * carryFactor;
      }
      
      if (maxTotalDistance > 0 && avgTotalDistance > 0) {
        overhitRisk = maxTotalDistance - avgTotalDistance;
      }

      // Apply air condition adjustments
      if (airCondition === 'rainy' && avgFlatCarry > 0) {
        avgFlatCarry = avgFlatCarry * 0.9;
      }
      if (airCondition === 'windy' && overhitRisk > 0) {
        overhitRisk = overhitRisk * 1.2;
      }

      return {
        ...club,
        'Carry (Yards)': carry,
        'Average Flat Carry (Yards)': avgFlatCarry,
        'Overhit Risk (Yards)': overhitRisk,
        'Average Total Distance Hit (Yards)': avgTotalDistance,
        isHighlighted: highlightedClub === club['Club'],
      };
    } catch (error) {
      console.error('Error processing club data:', club, error);
      // Return a safe fallback
      return {
        ...club,
        'Carry (Yards)': 0,
        'Average Flat Carry (Yards)': 0,
        'Overhit Risk (Yards)': 0,
        'Average Total Distance Hit (Yards)': 0,
        isHighlighted: false,
      };
    }
  });

  // Log the data arrays for each series
  console.log('=== SERIES DATA ARRAYS ===');
  
  // Log data for each bar series
  DISTANCE_FIELDS.forEach(field => {
    const dataArray = chartData.map(club => club[field]);
    console.log(`${field}:`, dataArray);
  });
  
  // Log data for the line series
  const lineDataArray = chartData.map(club => club[LINE_FIELD]);
  console.log(`${LINE_FIELD}:`, lineDataArray);
  console.log('Line data type:', typeof lineDataArray[0]);
  console.log('Line data sample:', lineDataArray.slice(0, 3));
  
  console.log('========================');

  // Debounced club recommendation function
  const debouncedRecommendClub = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (distance: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
                  if (!distance || !chartData.length) {
          setRecommendedClub(null);
          setHighlightedClub(null);
          return;
        }

          const targetDistance = parseFloat(distance);
          if (isNaN(targetDistance)) {
            setRecommendedClub(null);
            setHighlightedClub(null);
            return;
          }

          // Filter clubs with valid Average Total Distance Hit data
          const validClubs = chartData.filter(club => 
            club['Average Total Distance Hit (Yards)'] > 0
          );

          if (validClubs.length === 0) {
            setRecommendedClub(null);
            setHighlightedClub(null);
            return;
          }

          let bestClub = validClubs[0];
          let bestDistance = bestClub['Average Total Distance Hit (Yards)'];
          let bestDifference = Math.abs(bestDistance - targetDistance);

          // Determine search strategy based on conditions
          const isDryCondition = courseCondition.includes('dry');
          const isWetCondition = courseCondition.includes('wet');

          if (isDryCondition) {
            // For dry conditions: find closest club that hits LESS than target distance
            validClubs.forEach(club => {
              const clubDistance = club['Average Total Distance Hit (Yards)'];
              if (clubDistance <= targetDistance) {
                const difference = targetDistance - clubDistance;
                if (difference < bestDifference) {
                  bestClub = club;
                  bestDistance = clubDistance;
                  bestDifference = difference;
                }
              }
            });
          } else if (isWetCondition) {
            // For wet conditions: find closest club that hits MORE than target distance
            validClubs.forEach(club => {
              const clubDistance = club['Average Total Distance Hit (Yards)'];
              if (clubDistance >= targetDistance) {
                const difference = clubDistance - targetDistance;
                if (difference < bestDifference) {
                  bestClub = club;
                  bestDistance = clubDistance;
                  bestDifference = difference;
                }
              }
            });
          } else {
            // For normal conditions: find closest club regardless of over/under
            validClubs.forEach(club => {
              const clubDistance = club['Average Total Distance Hit (Yards)'];
              const difference = Math.abs(clubDistance - targetDistance);
              if (difference < bestDifference) {
                bestClub = club;
                bestDistance = clubDistance;
                bestDifference = difference;
              }
            });
          }

          const actualDifference = bestDistance - targetDistance;
          setRecommendedClub({
            club: bestClub['Club'],
            distance: bestDistance,
            difference: actualDifference
          });
          setHighlightedClub(bestClub['Club']);
        }, 500);
      };
    })(),
    [chartData, courseCondition]
  );

  return (
    <div className="min-h-screen p-6">
      <div className="golf-main max-w-5xl mx-auto">
        <h1 className="text-xl md:text-xl font-bold mb-6 text-center text-blue-900 dark:text-white">
          Average Club Distances
        </h1>
        <div className="flex flex-col md:flex-row md:justify-center gap-8 mb-8 items-start w-full">
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="flex items-center" style={{ gap: '24px' }}>
              <label htmlFor="course-conditions" className="font-semibold text-white text-sm">Course conditions:</label>
              <select
                id="course-conditions"
                className="rounded-md border border-gray-400 bg-gray-800 text-white px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={courseCondition}
                onChange={e => setCourseCondition(e.target.value)}
              >
                {COURSE_CONDITIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className={`text-xs font-semibold`} style={{ color: carryLabelColor }}>{carryLabel}</div>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Course conditions info"
                  className="text-white hover:text-blue-400 focus:outline-none"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                >
                  <HiInformationCircle className="h-5 w-5" />
                </button>
                {showTooltip && <CourseInfoTooltip />}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="flex items-center" style={{ gap: '24px' }}>
              <label htmlFor="air-conditions" className="font-semibold text-white text-sm">Air conditions:</label>
              <select
                id="air-conditions"
                className="rounded-md border border-gray-400 bg-gray-800 text-white px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={airCondition}
                onChange={e => setAirCondition(e.target.value)}
              >
                {AIR_CONDITIONS.map((opt: { label: string; value: string }) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className={`text-xs font-semibold`} style={{ color: airLabelColor }}>{airLabel}</div>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Air conditions info"
                  className="text-white hover:text-blue-400 focus:outline-none"
                  onMouseEnter={() => setShowAirTooltip(true)}
                  onMouseLeave={() => setShowAirTooltip(false)}
                  onFocus={() => setShowAirTooltip(true)}
                  onBlur={() => setShowAirTooltip(false)}
                >
                  <HiInformationCircle className="h-5 w-5" />
                </button>
                {showAirTooltip && <AirInfoTooltip />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Distance to Hole Input */}
        <div className="flex flex-col md:flex-row md:justify-center gap-4 mb-6 items-center">
          <div className="flex items-center gap-3">
            <label htmlFor="distance-to-hole" className="font-semibold text-white text-sm">
              Distance to hole (yards):
            </label>
            <input
              id="distance-to-hole"
              type="number"
              value={distanceToHole}
              onChange={(e) => {
                setDistanceToHole(e.target.value);
                debouncedRecommendClub(e.target.value);
              }}
              className="rounded-md border border-gray-400 bg-gray-800 text-white px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-24"
              placeholder="0"
              min="0"
            />
            <button
              onClick={() => {
                setDistanceToHole('');
                setRecommendedClub(null);
                setHighlightedClub(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              title="Clear distance and highlighting"
            >
              Clear
            </button>
          </div>
          
          {recommendedClub && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-white">Recommended:</span>
              <span className="font-semibold text-blue-400">{recommendedClub.club}</span>
              <span className="text-white">({recommendedClub.distance} yards)</span>
              <span 
                className={`font-semibold ${
                  recommendedClub.difference > 0 
                    ? 'text-red-400' 
                    : 'text-green-400'
                }`}
              >
                {recommendedClub.difference > 0 ? '+' : ''}{recommendedClub.difference} yards
              </span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-center text-lg text-gray-600 dark:text-gray-300">Loading...</div>
        ) : (
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6" ref={chartRef}>
            <CustomLegend />
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: yAxisTopMargin, right: 40, left: 120, bottom: yAxisBottomMargin }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#fff' }}
                  domain={[0, 'dataMax + 30']}
                  label={{ value: 'Distance (yards)', position: 'insideBottom', offset: -10, fill: '#fff', fontSize: 14 }}
                />
                <YAxis
                  type="category"
                  dataKey="Club"
                  tick={(props) => <ClickableYAxisTick {...props} clubs={clubs} onEdit={handleEdit} highlightedClub={highlightedClub} />}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip distanceFields={DISTANCE_FIELDS as unknown as string[]} lineField={LINE_FIELD} />} />
                                {DISTANCE_FIELDS.map((field) => (
                  <Bar
                    key={field}
                    dataKey={field}
                    stackId="a"
                    fill={BAR_COLORS[field]}
                    barSize={22}
                    radius={0}
                    isAnimationActive={true}
                    animationDuration={600}
                    style={{ cursor: 'pointer' }}
                  >
                    <LabelList
                      dataKey={field}
                      position="right"
                      style={{ fontSize: 12, fill: BAR_COLORS[field] === '#ef4444' ? '#ef4444' : '#fff', fontWeight: BAR_COLORS[field] === '#ef4444' ? 700 : 500 }}
                      formatter={(label: React.ReactNode) => (typeof label === 'string' && label !== '0' ? label : '')}
                    />
                  </Bar>
                ))}
                {/* Highlight overlay for recommended club */}
                {highlightedClub && (
                  <Bar
                    dataKey="isHighlighted"
                    stackId="highlight"
                    fill="rgba(255, 255, 0, 0.2)"
                    barSize={22}
                    radius={0}
                    isAnimationActive={false}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey={LINE_FIELD}
                  stroke={LINE_COLOR}
                  strokeWidth={3}
                  dot={{ r: 5, fill: LINE_COLOR, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={true}
                  animationDuration={600}
                  label={{ position: 'right', fontSize: 13, fill: LINE_COLOR, fontWeight: 700 }}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <ClubEditModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          club={editClub}
          onSave={handleSave}
          distanceFields={DISTANCE_FIELDS as unknown as string[]}
          lineField={LINE_FIELD}
        />
        <ApiDebugger />
      </div>
    </div>
  );
}

export default App;
