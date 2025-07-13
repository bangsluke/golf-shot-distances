import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [showWarn, setShowWarn] = useState(false);
  const [dirty, setDirty] = useState(false);

  console.log('ClubEditModal render - open:', open, 'club:', club);

  useEffect(() => {
    console.log('ClubEditModal useEffect - club changed:', club);
    setForm(club || ({} as ClubData));
    setDirty(false);
  }, [club]);

  // Remove the early return that prevents rendering when club is null
  // if (!club) return null;

  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleClose = () => {
    if (dirty) {
      setShowWarn(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowWarn(false);
    onClose();
  };

  // Only render the modal content if we have a club and modal is open
  if (!club || !open) {
    console.log('ClubEditModal not rendering - club:', club, 'open:', open);
    return null;
  }

  console.log('ClubEditModal rendering modal content');

  const modalContent = (
    <Dialog open={open} onClose={handleClose} className="fixed z-[999999] inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
        <Dialog.Panel className="relative w-full max-w-2xl mx-auto bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 p-8 z-[999999] min-h-[80vh] flex flex-col" style={{ zIndex: 999999 }}>
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl font-bold focus:outline-none"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
          <Dialog.Title className="text-2xl font-bold mb-6 text-center">Edit {club['Club']}</Dialog.Title>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSave(form);
              setDirty(false);
            }}
            className="space-y-4 flex-1 flex flex-col justify-center"
          >
            {[...distanceFields, lineField, 'Max Flat Carry (Yards)', 'Max Total Distance Hit (Yards)'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-200 mb-1">{field}</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                  value={form[field] || ''}
                  onChange={e => handleFieldChange(field, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Comments</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                value={form['Comments'] || ''}
                onChange={e => handleFieldChange('Comments', e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-8">
              <button type="button" onClick={handleClose} className="px-5 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">Close</button>
              <button type="submit" className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
            </div>
          </form>
        </Dialog.Panel>
        {showWarn && (
          <div className="fixed inset-0 flex items-center justify-center z-[999999] bg-black/60" style={{ zIndex: 999999 }}>
            <div className="bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 p-8 max-w-sm w-full">
              <div className="font-bold text-lg mb-4">Unsaved changes</div>
              <div className="mb-6">You have unsaved changes. Are you sure you want to close without saving?</div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600" onClick={() => setShowWarn(false)}>Cancel</button>
                <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={handleConfirmClose}>Discard changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );

  // Use portal to render modal directly in document body
  return createPortal(modalContent, document.body);
} 