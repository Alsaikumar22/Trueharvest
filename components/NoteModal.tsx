import React, { useState, useEffect } from 'react';

interface NoteModalProps {
  verseRef: string;
  initialNote: string;
  onSave: (ref: string, text: string) => void;
  onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ verseRef, initialNote, onSave, onClose }) => {
  const [noteText, setNoteText] = useState(initialNote);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSave = () => {
    onSave(verseRef, noteText);
  };
  
  const reference = verseRef.split(':').slice(1).join(' ');

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif font-bold text-white">Note for {reference}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write your thoughts and reflections here..."
          className="w-full h-48 p-3 bg-slate-900 border border-slate-600 text-white rounded-md shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-400 resize-y"
          autoFocus
        />
        
        <div className="flex justify-end items-center mt-4 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-slate-900 bg-amber-500 rounded-md hover:bg-amber-400 transition"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
