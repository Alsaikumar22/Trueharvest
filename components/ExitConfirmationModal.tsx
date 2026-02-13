
import React, { useState, useEffect } from 'react';
import { EXIT_VERSES } from '../services/constants';
import Logo from './Logo';

interface ExitConfirmationModalProps {
    onCancel: () => void;
    onConfirmExit: () => void;
}

const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({ onCancel, onConfirmExit }) => {
    const [verse, setVerse] = useState<{ text: string, ref: string } | null>(null);

    useEffect(() => {
        // Pick a random verse on mount
        const random = EXIT_VERSES[Math.floor(Math.random() * EXIT_VERSES.length)];
        setVerse(random);
    }, []);

    if (!verse) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-center mb-6">
                    <Logo svgClassName="w-12 h-12 text-amber-500/80" showText={false} />
                </div>

                <h2 className="text-xl font-serif font-bold text-white mb-2">Before you go...</h2>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-8">Receive this word</p>

                <div className="mb-10 relative">
                    <span className="absolute -top-4 -left-2 text-4xl text-slate-700 font-serif opacity-50">“</span>
                    <p className="text-lg text-slate-200 font-serif leading-relaxed italic">
                        {verse.text}
                    </p>
                    <span className="absolute -bottom-4 -right-2 text-4xl text-slate-700 font-serif opacity-50">”</span>
                    <p className="text-amber-500 text-sm font-bold mt-4">— {verse.ref}</p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={onConfirmExit}
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-95"
                    >
                        Amen & Exit
                    </button>
                    <button 
                        onClick={onCancel}
                        className="w-full py-3 text-slate-400 hover:text-white text-sm font-bold transition-colors"
                    >
                        Stay in Sanctuary
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExitConfirmationModal;
