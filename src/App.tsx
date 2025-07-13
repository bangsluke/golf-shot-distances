import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import { Dialog } from '@headlessui/react';
import './index.css';

const API_URL = 'http://localhost:4000/api/clubs';

const BAR_COLORS = [
  '#60a5fa', // blue-400
  '#fbbf24', // yellow-400
  '#34d399', // green-400
  '#f87171', // red-400
  '#a78bfa', // purple-400
  '#f472b6', // pink-400
  '#facc15', // yellow-300
];

const DISTANCE_FIELDS = [
  'Average Flat Carry (Yards)',
  'Max Flat Carry (Yards)',
  'Average Total Distance Hit (Yards)',
  'Max Total Distance Hit (Yards)',
  'Carry (Yards)',
  'Overhit Risk (Yards)'
];

function ClubEditModal({ open, onClose, club, onSave }: any) {
  const [form, setForm] = useState(club || {});

  useEffect(() => {
    setForm(club || {});
  }, [club]);

  if (!club) return null;

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto p-6 z-20">
          <Dialog.Title className="text-lg font-bold mb-4">Edit {club['Club']}</Dialog.Title>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSave(form);
            }}
            className="space-y-3"
          >
            {DISTANCE_FIELDS.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{field}</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={form[field] || ''}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Comments</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={form['Comments'] || ''}
                onChange={e => setForm({ ...form, ['Comments']: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const club = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="font-bold mb-2">{club['Club']}</div>
        {DISTANCE_FIELDS.map((field, i) => (
          <div key={field} className="text-sm"><span className="font-medium">{field}:</span> {club[field]}</div>
        ))}
        <div className="text-xs text-gray-500 mt-2">{club['Comments']}</div>
      </div>
    );
  }
  return null;
}

function App() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editClub, setEditClub] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchClubs = async () => {
    setLoading(true);
    const res = await axios.get(API_URL);
    setClubs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleEdit = (club: any) => {
    setEditClub(club);
    setModalOpen(true);
  };

  const handleSave = async (updated: any) => {
    await axios.put(`${API_URL}/${encodeURIComponent(updated['Club'])}`, updated);
    setModalOpen(false);
    setEditClub(null);
    fetchClubs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900 dark:text-white">Golf Club Distances</h1>
        {loading ? (
          <div className="text-center text-lg text-gray-600 dark:text-gray-300">Loading...</div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={clubs} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="Club" tick={{ fontSize: 12, fill: '#1e293b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#1e293b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {DISTANCE_FIELDS.map((field, i) => (
                  <Bar key={field} dataKey={field} stackId="a" fill={BAR_COLORS[i % BAR_COLORS.length]}>
                    <LabelList dataKey={field} position="top" style={{ fontSize: 10, fill: '#334155' }} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club, idx) => (
                <div key={club['Club']} className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col shadow border border-blue-100 dark:border-gray-700">
                  <div className="font-bold text-lg text-blue-900 dark:text-white">{club['Club']}</div>
                  <div className="text-xs text-gray-500 mb-2">{club['Comments']}</div>
                  <div className="flex-1">
                    {DISTANCE_FIELDS.map((field, i) => (
                      <div key={field} className="flex justify-between text-sm py-0.5">
                        <span className="text-gray-700 dark:text-gray-200">{field}:</span>
                        <span className="font-mono text-blue-700 dark:text-blue-300">{club[field]}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-3 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium self-end"
                    onClick={() => handleEdit(club)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <ClubEditModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          club={editClub}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

export default App;
