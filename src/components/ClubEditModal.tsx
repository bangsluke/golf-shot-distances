import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';

export interface ClubData {
  Club: string;
  'Average Flat Carry (Yards)': string;
  'Carry (Yards)': string;
  'Overhit Risk (Yards)': string;
  'Average Total Distance Hit (Yards)': string;
  'Max Flat Carry (Yards)': string;
  'Max Total Distance Hit (Yards)': string;
  Comments: string;
  [key: string]: string;
}

interface ClubEditModalProps {
  open: boolean;
  onClose: () => void;
  club: ClubData | null;
  onSave: (club: ClubData) => void;
  distanceFields: string[];
  lineField: string;
}

export function ClubEditModal({ open, onClose, club, onSave, distanceFields, lineField }: ClubEditModalProps) {
  const [form, setForm] = useState<ClubData>(club || ({} as ClubData));

  useEffect(() => {
    setForm(club || ({} as ClubData));
  }, [club]);

  if (!club) return null;

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="relative bg-gray-900 bg-opacity-95 text-white rounded-lg shadow-lg border border-gray-700 w-full max-w-md mx-auto p-6 z-20">
          <Dialog.Title className="text-lg font-bold mb-4">Edit {club['Club']}</Dialog.Title>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSave(form);
            }}
            className="space-y-3"
          >
            {[...distanceFields, lineField, 'Max Flat Carry (Yards)', 'Max Total Distance Hit (Yards)'].map(field => (
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
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 