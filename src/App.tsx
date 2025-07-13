import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Line, CartesianGrid
} from 'recharts';
import { ClubEditModal } from './components/ClubEditModal';
import type { ClubData } from './components/ClubEditModal';
import { CustomTooltip } from './components/CustomTooltip';
import { ClickableYAxisTick } from './components/ClickableYAxisTick';
import { CustomLegend } from './components/CustomLegend';
import { CourseInfoTooltip } from './components/CourseInfoTooltip';
import { AirInfoTooltip } from './components/AirInfoTooltip';
import './index.css';

const API_URL = 'http://localhost:4000/api/clubs';

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
  const chartRef = useRef<HTMLDivElement>(null);

  const fetchClubs = async () => {
    setLoading(true);
    const res = await axios.get(API_URL);
    setClubs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleEdit = (club: ClubData) => {
    setEditClub(club);
    setModalOpen(true);
  };

  const handleSave = async (updated: ClubData) => {
    await axios.put(`${API_URL}/${encodeURIComponent(updated['Club'])}`, updated);
    setModalOpen(false);
    setEditClub(null);
    fetchClubs();
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
  const carryLabelColor = carryFactor > 1 ? 'text-green-500' : carryFactor < 1 ? 'text-red-500' : 'text-gray-400';

  // Compute air condition factor and label
  let airLabel = '';
  let airLabelColor = 'text-gray-400';
  if (airCondition === 'rainy') {
    airLabel = 'Avg Flat Carry -10%';
    airLabelColor = 'text-red-500';
  } else if (airCondition === 'windy') {
    airLabel = 'Overhit Risk +20%';
    airLabelColor = 'text-green-500';
  } else {
    airLabel = 'No adjustment';
    airLabelColor = 'text-gray-400';
  }

  // Adjust Average Flat Carry and Overhit Risk based on air condition
  const chartData = clubs.map(club => {
    const carryRaw = parseFloat(club['Carry (Yards)']);
    const avgFlatCarryRaw = parseFloat(club['Average Flat Carry (Yards)']);
    const overhitRiskRaw = parseFloat(club['Overhit Risk (Yards)']);

    const carry = (isNaN(carryRaw) ? 0 : carryRaw) * carryFactor;
    let avgFlatCarry = isNaN(avgFlatCarryRaw) ? 0 : avgFlatCarryRaw;
    let overhitRisk = isNaN(overhitRiskRaw) ? 0 : overhitRiskRaw;

    if (airCondition === 'rainy') {
      avgFlatCarry = avgFlatCarry * 0.9;
    }
    if (airCondition === 'windy') {
      overhitRisk = overhitRisk * 1.2;
    }
    return {
      ...club,
      'Carry (Yards)': carry.toFixed(0),
      'Average Flat Carry (Yards)': avgFlatCarry.toFixed(0),
      'Overhit Risk (Yards)': overhitRisk.toFixed(0),
    };
  });

  return (
    <div className="min-h-screen p-6">
      <div className="golf-main max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-900 dark:text-white">
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
              <div className={`text-xs font-semibold ${carryLabelColor}`}>{carryLabel}</div>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white fill-white" fill="white" viewBox="0 0 24 24" stroke="white"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" /></svg>
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
              <div className={`text-xs font-semibold ${airLabelColor}`}>{airLabel}</div>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white fill-white" fill="white" viewBox="0 0 24 24" stroke="white"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" /></svg>
                </button>
                {showAirTooltip && <AirInfoTooltip />}
              </div>
            </div>
          </div>
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
                  tick={(props) => <ClickableYAxisTick {...props} clubs={clubs} onEdit={handleEdit} />}
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
                  >
                    <LabelList
                      dataKey={field}
                      position="right"
                      style={{ fontSize: 12, fill: BAR_COLORS[field] === '#ef4444' ? '#ef4444' : '#fff', fontWeight: BAR_COLORS[field] === '#ef4444' ? 700 : 500 }}
                      formatter={(label: React.ReactNode) => (typeof label === 'string' && label !== '0' ? label : '')}
                    />
                  </Bar>
                ))}
                <Line
                  type="monotone"
                  dataKey={LINE_FIELD}
                  stroke={LINE_COLOR}
                  strokeWidth={3}
                  dot={{ r: 5, fill: LINE_COLOR, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={true}
                  animationDuration={600}
                  label={{ position: 'top', fontSize: 13, fill: LINE_COLOR, fontWeight: 700 }}
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
      </div>
    </div>
  );
}

export default App;
