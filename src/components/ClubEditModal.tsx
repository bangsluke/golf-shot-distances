import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ClubData {
  Club: string;
  'Average Flat Carry (Yards)': string;
  'Average Roll (Yards)': string;
  'Overhit Risk (Yards)': string;
  'Average Total Distance Hit (Yards)': string;
  'Max Flat Carry (Yards)': string;
  'Max Total Distance Hit (Yards)': string;
  'Make': string;
  'Model': string;
  'LastUpdated': string;
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
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (club) {
      // Initialize calculated fields if they don't exist
      const initialForm = { ...club };
      
      // Calculate Carry if not present
          if (!initialForm['Average Roll (Yards)']) {
      const avgTotalDistance = parseFloat(initialForm['Average Total Distance Hit (Yards)'] || '0');
      const avgFlatCarry = parseFloat(initialForm['Average Flat Carry (Yards)'] || '0');
      initialForm['Average Roll (Yards)'] = (avgTotalDistance - avgFlatCarry).toFixed(0);
    }
      
      // Calculate Overhit Risk if not present
      if (!initialForm['Overhit Risk (Yards)']) {
        const maxTotalDistance = parseFloat(initialForm['Max Total Distance Hit (Yards)'] || '0');
        const avgTotalDistance = parseFloat(initialForm['Average Total Distance Hit (Yards)'] || '0');
        initialForm['Overhit Risk (Yards)'] = (maxTotalDistance - avgTotalDistance).toFixed(0);
      }
      
      setForm(initialForm);
    } else {
      setForm({} as ClubData);
    }
    setDirty(false);
  }, [club]);

  const handleFieldChange = (field: string, value: string) => {
    const newForm = { ...form, [field]: value };
    
    // Calculate Carry: Average Total Distance Hit - Average Flat Carry
            if (field === 'Average Total Distance Hit (Yards)' || field === 'Average Flat Carry (Yards)') {
          const avgTotalDistance = parseFloat(newForm['Average Total Distance Hit (Yards)'] || '0');
          const avgFlatCarry = parseFloat(newForm['Average Flat Carry (Yards)'] || '0');
          const averageRoll = avgTotalDistance - avgFlatCarry;
          newForm['Average Roll (Yards)'] = averageRoll.toFixed(0);
        }
    
    // Calculate Overhit Risk: Max Total Distance Hit - Average Total Distance Hit
    if (field === 'Max Total Distance Hit (Yards)' || field === 'Average Total Distance Hit (Yards)') {
      const maxTotalDistance = parseFloat(newForm['Max Total Distance Hit (Yards)'] || '0');
      const avgTotalDistance = parseFloat(newForm['Average Total Distance Hit (Yards)'] || '0');
      const overhitRisk = maxTotalDistance - avgTotalDistance;
      newForm['Overhit Risk (Yards)'] = overhitRisk.toFixed(0);
    }
    
    setForm(newForm);
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
    return null;
  }

  // Simplified modal content with higher z-index and simpler structure
  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] overflow-y-auto"
      style={{ 
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75"
        style={{ 
          zIndex: 999999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="flex items-center justify-center min-h-screen p-2 sm:p-4"
        style={{ zIndex: 999999 }}
      >
        <div 
          className={`relative w-full mx-auto bg-gray-800 text-white rounded-lg shadow-lg border border-gray-600 ${isMobile ? 'p-4' : 'p-8'} ${isMobile ? 'max-w-sm' : 'max-w-2xl'}`}
          style={{ 
            zIndex: 999999,
            position: 'relative',
            backgroundColor: '#1f2937',
            color: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            border: '1px solid #374151',
            padding: isMobile ? '1rem' : '2rem'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-red-400 text-xl sm:text-2xl font-bold focus:outline-none"
            onClick={handleClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: isMobile ? '0.5rem' : '1rem',
              right: isMobile ? '0.5rem' : '1rem',
              color: '#9ca3af',
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              fontWeight: 'bold',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
          
          <h2 className={`font-bold mb-4 sm:mb-6 text-center ${isMobile ? 'text-lg' : 'text-2xl'}`}>Edit {club['Club']}</h2>
          
          <form
            onSubmit={e => {
              e.preventDefault();
              // Auto-populate LastUpdated with current date and time
              const now = new Date();
              const formattedDateTime = now.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              });
              const formWithTimestamp = { ...form, 'LastUpdated': formattedDateTime };
              onSave(formWithTimestamp);
              setDirty(false);
            }}
            className="space-y-3 sm:space-y-4"
          >
            {/* Custom field order */}
            {[
              'Make',
              'Model', 
              'Average Total Distance Hit (Yards)',
              'Average Flat Carry (Yards)',
              'Max Flat Carry (Yards)',
              'Max Total Distance Hit (Yards)',
              'Average Roll (Yards)',
              'Overhit Risk (Yards)',
              'Comments',
              'LastUpdated'
            ].map(field => {
              const isReadOnly = field === 'Average Roll (Yards)' || field === 'Overhit Risk (Yards)' || field === 'LastUpdated';
              const isNumberField = field.includes('(Yards)') && field !== 'LastUpdated';
              
              return (
                <div key={field}>
                  <label className={`block font-medium text-gray-200 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {field}
                    {isReadOnly && field !== 'LastUpdated' && <span className="text-xs text-gray-400 ml-2">(Calculated)</span>}
                    {field === 'LastUpdated' && <span className="text-xs text-gray-400 ml-2">(Auto-generated)</span>}
                  </label>
                  <input
                    type={isNumberField ? "number" : "text"}
                    className={`mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
                    value={field === 'LastUpdated' ? (form[field] || 'Will be set on save') : (form[field] || '')}
                    onChange={e => handleFieldChange(field, e.target.value)}
                    readOnly={isReadOnly}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.125rem 0.5rem' : '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #374151',
                      backgroundColor: isReadOnly ? '#374151' : '#1f2937',
                      color: isReadOnly ? '#9ca3af' : 'white',
                      cursor: isReadOnly ? 'not-allowed' : 'text',
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}
                  />
                </div>
              );
            })}
            <div className="flex justify-end gap-2 mt-6 sm:mt-8">
              <button 
                type="button" 
                onClick={handleClose} 
                className={`rounded bg-gray-700 text-gray-200 hover:bg-gray-600 ${isMobile ? 'px-3 py-0.5 text-xs' : 'px-5 py-1 text-sm'}`}
                style={{
                  padding: isMobile ? '0.125rem 0.75rem' : '0.25rem 1.25rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#374151',
                  color: '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Close
              </button>
              <button 
                type="submit" 
                className={`rounded bg-blue-600 text-white hover:bg-blue-700 ${isMobile ? 'px-3 py-0.5 text-xs' : 'px-5 py-1 text-sm'}`}
                style={{
                  padding: isMobile ? '0.125rem 0.75rem' : '0.25rem 1.25rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Warning dialog */}
      {showWarn && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[999999] bg-black/60"
          style={{ 
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }}
        >
          <div 
            className={`bg-gray-800 text-white rounded-lg shadow-lg border border-gray-600 ${isMobile ? 'p-4' : 'p-8'} ${isMobile ? 'max-w-xs' : 'max-w-sm'} w-full mx-4`}
            style={{
              backgroundColor: '#1f2937',
              color: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              border: '1px solid #374151',
              padding: isMobile ? '1rem' : '2rem',
              maxWidth: isMobile ? '20rem' : '24rem',
              width: '100%'
            }}
          >
            <div className={`font-bold mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>Unsaved changes</div>
            <div className={`mb-6 ${isMobile ? 'text-sm' : 'text-base'}`}>You have unsaved changes. Are you sure you want to close without saving?</div>
            <div className="flex justify-end gap-2">
              <button 
                className={`rounded bg-gray-700 text-gray-200 hover:bg-gray-600 ${isMobile ? 'px-3 py-0.5 text-xs' : 'px-4 py-1 text-sm'}`}
                onClick={() => setShowWarn(false)}
                style={{
                  padding: isMobile ? '0.125rem 0.75rem' : '0.25rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#374151',
                  color: '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Cancel
              </button>
              <button 
                className={`rounded bg-red-600 text-white hover:bg-red-700 ${isMobile ? 'px-3 py-0.5 text-xs' : 'px-4 py-1 text-sm'}`}
                onClick={handleConfirmClose}
                style={{
                  padding: isMobile ? '0.125rem 0.75rem' : '0.25rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Discard changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Use portal to render modal directly in document body
  return createPortal(modalContent, document.body);
} 