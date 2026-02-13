
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { generateVerseSummary } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import XIcon from './icons/XIcon';
import LinkIcon from './icons/LinkIcon';

interface VerseSummaryModalProps {
  verseText: string;
  reference: string;
  language: string;
  onClose: () => void;
  position?: 'top' | 'bottom'; // Deprecated, handled by fixed centering
}

interface CrossReference {
    ref: string;
    text: string;
}

interface SummaryData {
    key_word: string;
    summary: string;
    cross_references: CrossReference[];
}

const VerseSummaryModal: React.FC<VerseSummaryModalProps> = ({ verseText, reference, language, onClose }) => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const result = await generateVerseSummary(verseText, reference, language);
            if (isMounted) {
                if (result) {
                    setData(result);
                } else {
                    setErrorMsg("AI service temporarily unavailable.");
                }
            }
        } catch (e) {
            console.error(e);
            if (isMounted) setErrorMsg("Failed to generate insight.");
        } finally {
            if (isMounted) setIsLoading(false);
        }
    };
    fetchSummary();
    return () => { isMounted = false; };
  }, [verseText, reference, language]);

  // Use a Portal to render outside the current DOM hierarchy (avoids overflow/z-index issues)
  // Strictly center content using Flexbox full-screen overlay
  return createPortal(
    <div 
        className="fixed inset-0 z-[10005] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn touch-none h-screen w-screen"
        onClick={onClose}
    >
        <div 
          className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp flex flex-col max-h-[85vh] relative mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <div className="flex items-center">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 mr-2">
                        <SparklesIcon className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-bold font-serif text-slate-200">Insight: {reference}</h2>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-slate-500 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 active:bg-slate-700"
                >
                    <XIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto custom-scrollbar bg-slate-900">
                {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-700 border-t-amber-500"></div>
                            <div className="absolute inset-0 m-auto h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Consulting the Word...</p>
                     </div>
                ) : errorMsg ? (
                     <div className="text-center py-6 bg-red-500/5 rounded-xl border border-red-500/20">
                        <p className="text-red-400 text-xs font-bold mb-3">{errorMsg}</p>
                        <button 
                            onClick={() => { setIsLoading(true); setErrorMsg(null); generateVerseSummary(verseText, reference, language).then(r => { setData(r); setIsLoading(false); if(!r) setErrorMsg('Retry failed.'); }); }} 
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                        >
                            Retry
                        </button>
                     </div>
                ) : data ? (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="inline-flex flex-col items-center">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Key Theme</span>
                                <span className="px-5 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                    {data.key_word}
                                </span>
                            </div>
                        </div>
                        
                        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                            <p className="text-slate-300 text-sm leading-loose text-center font-medium">
                                {data.summary}
                            </p>
                        </div>
                        
                        {data.cross_references && data.cross_references.length > 0 && (
                            <div className="pt-2">
                                <div className="flex items-center mb-3">
                                    <LinkIcon className="h-3 w-3 text-slate-500 mr-1.5" />
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Biblical Connections</span>
                                </div>
                                <div className="space-y-2">
                                    {data.cross_references.map((item, idx) => (
                                        <div key={idx} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex flex-col">
                                            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wide mb-1">{item.ref}</span>
                                            <p className="text-xs text-slate-400 italic font-serif">"{item.text}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    </div>,
    document.body
  );
};

export default VerseSummaryModal;
