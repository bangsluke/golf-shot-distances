import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Line, CartesianGrid
} from 'recharts';

import { ClubEditModal } from './components/ClubEditModal';
import type { ClubData } from './components/ClubEditModal';
import { CustomTooltip } from './components/CustomTooltip';
import { ClickableYAxisTick } from './components/ClickableYAxisTick';
import { CustomLegend } from './components/CustomLegend';
import { CourseInfoTooltip } from './components/CourseInfoTooltip';
import { AirInfoTooltip } from './components/AirInfoTooltip';

import './index.css';

// Use Netlify function URL in production, localhost in development
const API_URL = import.meta.env.PROD 
  ? '/api/clubs' 
  : 'http://localhost:4000/api/clubs';

const BAR_COLORS = {
  'Average Flat Carry (Yards)': '#60a5fa', // blue-400
  'Average Roll (Yards)': '#3b82f6', // blue-600
  'Overhit Risk (Yards)': '#ef4444', // red-500
};

const LINE_COLOR = '#22c55e'; // green-500

const DISTANCE_FIELDS = [
  'Average Flat Carry (Yards)',
  'Average Roll (Yards)',
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
  const [reordering, setReordering] = useState(false);
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
      
      // Check if any clubs need reordering
      const needsReordering = res.data.some((club: ClubData) => !club['ClubOrder'] || isNaN(parseInt(club['ClubOrder'])));
      if (needsReordering) {
        await reorderClubs();
      }
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
      // If ClubOrder is missing or invalid, assign a default value
      if (!updated['ClubOrder'] || isNaN(parseInt(updated['ClubOrder']))) {
        const maxOrder = Math.max(...clubs.map(club => parseInt(club['ClubOrder'] || '0') || 0));
        updated['ClubOrder'] = (maxOrder + 1).toString();
      }
      
      // Check if this is a new club creation by checking if the original club was "New Club"
      // or if the club name starts with "New" (indicating it's still being created)
      const isNewClub = !editClub || 
                       editClub['Club'] === 'New Club' || 
                       editClub['Club'].startsWith('New') ||
                       updated['Club'].startsWith('New');
      
      if (isNewClub) {
        // Create new club
        await axios.post(API_URL, updated);
      } else {
        // Update existing club
        await axios.put(`${API_URL}/${encodeURIComponent(updated['Club'])}`, updated);
      }
      
      setModalOpen(false);
      setEditClub(null);
      fetchClubs();
    } catch (error) {
      console.error('Failed to save club:', error);
      // Re-throw the error so the modal can catch and display it
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to save club data');
      } else {
        throw new Error('Failed to save club data');
      }
    }
  };

  const handleDelete = async (club: ClubData) => {
    const clubName = club['Club']?.trim();
    
    try {
      console.log('handleDelete called with club:', club);
      console.log('Club name after trim:', `"${clubName}"`);
      
      if (!clubName || clubName === '' || clubName === 'New Club') {
        console.log('Validation failed: invalid club name');
        throw new Error('Cannot delete a club with an invalid or default name. Please rename the club first.');
      }
      
      // Check if the club actually exists in our current data
      const existingClub = clubs.find(c => c['Club'] === clubName);
      console.log('Existing club found:', existingClub);
      
      if (!existingClub) {
        console.log('Validation failed: club not found in current data');
        throw new Error(`Club "${clubName}" not found. It may have already been deleted or renamed.`);
      }
      
      console.log('Proceeding with delete for club:', clubName);
      await axios.delete(`${API_URL}/${encodeURIComponent(clubName)}`);
      setModalOpen(false);
      setEditClub(null);
      fetchClubs();
    } catch (error) {
      console.error('Failed to delete club:', error);
      // Re-throw the error so the modal can catch and display it
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Club "${clubName}" not found in the database. It may have already been deleted or never saved.`);
        } else {
          throw new Error(error.response?.data?.message || error.message || 'Failed to delete club');
        }
      } else {
        throw new Error(error instanceof Error ? error.message : 'Failed to delete club');
      }
    }
  };

  const handleAdd = () => {
    const maxOrder = Math.max(...clubs.map(club => parseInt(club['ClubOrder'] || '0') || 0));
    const newClub: ClubData = {
      Club: 'New Club',
      'Average Flat Carry (Yards)': '',
      'Average Roll (Yards)': '',
      'Overhit Risk (Yards)': '',
      'Average Total Distance Hit (Yards)': '',
      'Max Flat Carry (Yards)': '',
      'Max Total Distance Hit (Yards)': '',
      'Make': '',
      'Model': '',
      'LastUpdated': '',
      'ClubOrder': (maxOrder + 1).toString(),
      Comments: ''
    };
    setEditClub(newClub);
    setModalOpen(true);
  };

  // Function to reorder clubs when ClubOrder values are missing
  const reorderClubs = async () => {
    setReordering(true);
    try {
      const clubsToUpdate = clubs.filter(club => !club['ClubOrder'] || isNaN(parseInt(club['ClubOrder'])));
      
      if (clubsToUpdate.length === 0) {
        return; // No clubs need reordering
      }

      // Get the current max order
      const maxOrder = Math.max(...clubs.map(club => parseInt(club['ClubOrder'] || '0') || 0));
      
      // Update clubs with missing ClubOrder values
      const updatePromises = clubsToUpdate.map((club, index) => {
        const updatedClub = { ...club, 'ClubOrder': (maxOrder + index + 1).toString() };
        return axios.put(`${API_URL}/${encodeURIComponent(club['Club'])}`, updatedClub);
      });

      await Promise.all(updatePromises);
      fetchClubs(); // Refresh the data
    } catch (error) {
      console.error('Failed to reorder clubs:', error);
    } finally {
      setReordering(false);
    }
  };

  // Calculate dynamic chart height based on number of clubs
  // Base height of 500px for 13 clubs, adjust proportionally
  const baseHeight = 500;
  const baseClubCount = 13;
  const currentClubCount = clubs.length;
  const chartHeight = Math.max(300, Math.min(800, baseHeight * (currentClubCount / baseClubCount)));
  
  const yAxisTopMargin = 30; // matches chart margin.top
  const yAxisBottomMargin = 30; // matches chart margin.bottom

  // Compute roll factor and label for course conditions
  const rollFactor = COURSE_CONDITIONS.find(c => c.value === courseCondition)?.factor ?? 1;
  let rollLabel = '';
  if (rollFactor === 1) rollLabel = 'Roll ±0%';
  else if (rollFactor > 1) rollLabel = `Roll +${Math.round((rollFactor - 1) * 100)}%`;
  else rollLabel = `Roll ${Math.round((rollFactor - 1) * 100)}%`;
  const rollLabelColor = rollFactor > 1 ? '#22c55e' : rollFactor < 1 ? '#ef4444' : '#9ca3af';

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
  const chartData = clubs
    .map(club => {
      try {
        // Parse values, handling empty strings
        const avgTotalDistanceStr = club['Average Total Distance Hit (Yards)'] || '';
        const avgFlatCarryStr = club['Average Flat Carry (Yards)'] || '';
        const maxTotalDistanceStr = club['Max Total Distance Hit (Yards)'] || '';
        
        const avgTotalDistance = avgTotalDistanceStr ? parseFloat(avgTotalDistanceStr) : 0;
        const avgFlatCarryRaw = avgFlatCarryStr ? parseFloat(avgFlatCarryStr) : 0;
        const maxTotalDistance = maxTotalDistanceStr ? parseFloat(maxTotalDistanceStr) : 0;
        
        // Only calculate if we have valid data
        let averageRoll = 0;
        let overhitRisk = 0;
        let avgFlatCarry = avgFlatCarryRaw;
        
        if (avgTotalDistance > 0 && avgFlatCarryRaw > 0) {
          averageRoll = (avgTotalDistance - avgFlatCarryRaw) * rollFactor;
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

        // Recalculate total distance based on adjusted flat carry and roll
        const adjustedTotalDistance = avgFlatCarry + averageRoll;

        return {
          ...club,
          'Average Roll (Yards)': Math.round(averageRoll),
          'Average Flat Carry (Yards)': Math.round(avgFlatCarry),
          'Overhit Risk (Yards)': Math.round(overhitRisk),
          'Average Total Distance Hit (Yards)': Math.round(adjustedTotalDistance),
          isHighlighted: highlightedClub === club['Club'],
        };
      } catch (error) {
        console.error('Error processing club data:', club, error);
        // Return a safe fallback
        return {
          ...club,
          'Average Roll (Yards)': 0,
          'Average Flat Carry (Yards)': 0,
          'Overhit Risk (Yards)': 0,
          'Average Total Distance Hit (Yards)': 0,
          isHighlighted: false,
        };
      }
    })
    .sort((a, b) => {
      // Sort by ClubOrder if available, otherwise maintain original order
      const orderA = parseInt(a['ClubOrder'] || '999999') || 999999;
      const orderB = parseInt(b['ClubOrder'] || '999999') || 999999;
      return orderA - orderB;
    });



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
    <div className="min-h-screen p-1 sm:p-2 md:p-6">
      <div className="golf-main w-full max-w-5xl mx-auto">
        <h1 className="text-base sm:text-lg md:text-2xl font-bold mb-2 sm:mb-4 md:mb-6 text-center text-blue-900 dark:text-white">
          Average Club Distances
        </h1>
        
        {/* Mobile-optimized controls layout */}
        <div className="flex flex-col gap-2 sm:gap-4 md:gap-6 mb-3 sm:mb-6 md:mb-8">
          {/* Course and Air Conditions - Stack vertically on mobile */}
          <div className="flex flex-col sm:flex-row sm:justify-center gap-2 sm:gap-4 md:gap-8 items-start w-full">
            <div className="flex flex-col items-center w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-6">
                <div className="relative">
                  <label 
                    htmlFor="course-conditions" 
                    className="font-semibold text-white text-xs cursor-help"
                    style={{ borderBottom: '1px dotted #9ca3af' }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
                    onTouchStart={() => setShowTooltip(true)}
                    onTouchEnd={() => setShowTooltip(false)}
                  >
                    Course conditions:
                  </label>
                  {showTooltip && <CourseInfoTooltip />}
                </div>
                <select
                  id="course-conditions"
                  className="rounded-md border border-gray-400 bg-gray-800 text-white px-2 sm:px-3 py-0.5 sm:py-1 md:py-2 text-xs focus:ring-blue-500 focus:border-blue-500"
                  value={courseCondition}
                  onChange={e => setCourseCondition(e.target.value)}
                >
                  {COURSE_CONDITIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="text-xs font-semibold" style={{ color: rollLabelColor }}>{rollLabel}</div>
              </div>
            </div>
            <div className="flex flex-col items-center w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-6">
                <div className="relative">
                  <label 
                    htmlFor="air-conditions" 
                    className="font-semibold text-white text-xs cursor-help"
                    style={{ borderBottom: '1px dotted #9ca3af' }}
                    onMouseEnter={() => setShowAirTooltip(true)}
                    onMouseLeave={() => setShowAirTooltip(false)}
                    onFocus={() => setShowAirTooltip(true)}
                    onBlur={() => setShowAirTooltip(false)}
                    onTouchStart={() => setShowAirTooltip(true)}
                    onTouchEnd={() => setShowAirTooltip(false)}
                  >
                    Air conditions:
                  </label>
                  {showAirTooltip && <AirInfoTooltip />}
                </div>
                <select
                  id="air-conditions"
                  className="rounded-md border border-gray-400 bg-gray-800 text-white px-2 sm:px-3 py-0.5 sm:py-1 md:py-2 text-xs focus:ring-blue-500 focus:border-blue-500"
                  value={airCondition}
                  onChange={e => setAirCondition(e.target.value)}
                >
                  {AIR_CONDITIONS.map((opt: { label: string; value: string }) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="text-xs font-semibold" style={{ color: airLabelColor }}>{airLabel}</div>
              </div>
            </div>
          </div>
          
          {/* Distance to Hole Input - Mobile optimized */}
          <div className="flex flex-col sm:flex-row sm:justify-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-4 md:mb-6 items-center">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-3">
              <label htmlFor="distance-to-hole" className="font-semibold text-white text-xs">
                Distance to hole (yards):
              </label>
              <div className="flex items-center gap-1 sm:gap-2">
                <input
                  id="distance-to-hole"
                  type="number"
                  value={distanceToHole}
                  onChange={(e) => {
                    setDistanceToHole(e.target.value);
                    debouncedRecommendClub(e.target.value);
                  }}
                  className="rounded-md border border-gray-400 bg-gray-800 text-white px-2 sm:px-3 py-0.5 sm:py-1 md:py-2 text-xs focus:ring-blue-500 focus:border-blue-500 w-20 sm:w-24"
                  placeholder="0"
                  min="0"
                />
                <button
                  onClick={() => {
                    setDistanceToHole('');
                    setRecommendedClub(null);
                    setHighlightedClub(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-0.5 sm:py-1 md:py-2 rounded text-xs font-medium transition-colors"
                  title="Clear distance and highlighting"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {recommendedClub && (
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs">
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
        </div>
        
        {loading ? (
          <div className="text-center text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">Loading...</div>
        ) : (
          <div className="relative bg-gray-800 rounded-lg p-1 sm:p-2 md:p-6 w-full" ref={chartRef}>
            <CustomLegend />
            <ResponsiveContainer width="100%" height={chartHeight}>
              <ComposedChart
                data={chartData}
                layout="vertical"
                margin={{ 
                  top: yAxisTopMargin, 
                  right: window.innerWidth < 768 ? 10 : 40, 
                  left: window.innerWidth < 768 ? 60 : 120, 
                  bottom: yAxisBottomMargin 
                }}
              >
                <CartesianGrid strokeDasharray="3"  vertical={true} horizontal={true} />
                <XAxis
                  type="number"
                  tick={{ fontSize: window.innerWidth < 768 ? 10 : 12, fill: '#fff' }}
                  domain={[0, 'dataMax + 30']}
                  tickCount={window.innerWidth < 768 ? 6 : 10}
                  label={{ 
                    value: 'Distance (yards)', 
                    position: 'insideBottom', 
                    offset: window.innerWidth < 768 ? -5 : -10, 
                    fill: '#fff', 
                    fontSize: window.innerWidth < 768 ? 12 : 14 
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="Club"
                  tick={(props) => <ClickableYAxisTick {...props} clubs={clubs} onEdit={handleEdit} highlightedClub={highlightedClub} />}
                  tickLine={false}
                  width={window.innerWidth < 768 ? 50 : 80}
                />
                <Tooltip content={<CustomTooltip distanceFields={DISTANCE_FIELDS as unknown as string[]} lineField={LINE_FIELD} />} />
                {DISTANCE_FIELDS.map((field) => (
                  <Bar
                    key={field}
                    dataKey={field}
                    stackId="a"
                    fill={BAR_COLORS[field]}
                    barSize={window.innerWidth < 768 ? 18 : 22}
                    radius={0}
                    isAnimationActive={true}
                    animationDuration={600}
                    style={{ cursor: 'pointer' }}
                  >
                    <LabelList
                      dataKey={field}
                      position="right"
                      style={{ 
                        fontSize: window.innerWidth < 768 ? 10 : 12, 
                        fill: BAR_COLORS[field] === '#ef4444' ? '#ef4444' : '#fff', 
                        fontWeight: BAR_COLORS[field] === '#ef4444' ? 700 : 500 
                      }}
                      formatter={(label: React.ReactNode) => (typeof label === 'string' && label !== '0' ? label : '')}
                    />
                  </Bar>
                ))}
                <Line
                  type="monotone"
                  dataKey={LINE_FIELD}
                  stroke={LINE_COLOR}
                  strokeWidth={window.innerWidth < 768 ? 2 : 3}
                  dot={{ r: window.innerWidth < 768 ? 3 : 5, fill: LINE_COLOR, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: window.innerWidth < 768 ? 5 : 7 }}
                  isAnimationActive={true}
                  animationDuration={600}
                  label={{ 
                    position: 'right', 
                    fontSize: window.innerWidth < 768 ? 11 : 13, 
                    fill: LINE_COLOR, 
                    fontWeight: 700 
                  }}
                  style={{ cursor: 'pointer' }}
                  connectNulls={false}
                />
                {/* Highlight overlay for recommended club */}
                {highlightedClub && (
                  <Bar
                    dataKey="isHighlighted"
                    stackId="highlight"
                    fill="rgba(255, 255, 0, 0.2)"
                    barSize={window.innerWidth < 768 ? 18 : 22}
                    radius={0}
                    isAnimationActive={false}
                  />
                )}

              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            onClick={reorderClubs}
            className={`text-white px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
              loading || reordering 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            title="Reorder clubs by assigning ClubOrder values"
            disabled={loading || reordering}
          >
            {loading || reordering ? 'Reordering...' : 'Reorder Clubs'}
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors"
            title="Add a new golf club"
          >
            Add New Club
          </button>
        </div>
        
        <ClubEditModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          club={editClub}
          onSave={handleSave}
          onDelete={handleDelete}
          distanceFields={DISTANCE_FIELDS as unknown as string[]}
          lineField={LINE_FIELD}
        />
      </div>
    </div>
  );
}

export default App;
