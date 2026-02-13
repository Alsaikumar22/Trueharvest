
import React, { useState, useEffect } from 'react';
import { getVerseOfTheDay } from '../services/geminiService';
import { updateMetadata } from '../services/seoService';
import type { VerseData, VerseContent, Page } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import ShareIcon from './icons/ShareIcon';
import SharePopover from './SharePopover';
import HomeIcon from './icons/HomeIcon';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full min-h-[50vh]">
    <div className="relative">
        <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-amber-400 relative z-10"></div>
    </div>
  </div>
);

// Safety helper to prevent Error #31 (rendering an object)
const renderSafeText = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return content.toString();
    if (!content) return "";
    if (typeof content === 'object') {
        try {
            return JSON.stringify(content);
        } catch (e) {
            return "[Incompatible Content]";
        }
    }
    return String(content);
};

interface VerseOfTheDayPageProps {
    setCurrentPage: (page: Page) => void;
}

const VerseOfTheDayPage: React.FC<VerseOfTheDayPageProps> = ({ setCurrentPage }) => {
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'english' | 'telugu' | 'tamil'>('english');
  const [showSharePopover, setShowSharePopover] = useState(false);

  useEffect(() => {
    updateMetadata(
        "Verse of the Day",
        "Daily biblical inspiration with theological insights, practical application, and prayer.",
        "/?page=verse"
    );

    const fetchVerse = async () => {
      try {
        setLoading(true);
        const data = await getVerseOfTheDay();
        setVerseData(data);
      } catch (err) {
        setError('Failed to fetch the verse of the day. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
  }, []);

  const currentVerse: VerseContent | undefined = verseData?.[selectedLang];

  if (loading) {
    return (
      <div className="relative min-h-[85vh] overflow-hidden rounded-3xl bg-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !verseData) {
    return <div className="text-center p-8 text-red-300 bg-red-900/50 border border-red-700 rounded-lg max-w-5xl mx-auto shadow-lg">{error || 'An unexpected error occurred.'}</div>;
  }

  return (
    <div className="relative min-h-[85vh] overflow-hidden rounded-3xl shadow-2xl">
      
      {/* --- Cinematic Background Layer --- */}
      <div className="absolute inset-0 z-0 select-none">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
            style={{ 
                backgroundImage: `url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2670&auto=format&fit=crop')`,
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/60"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
             <svg width="400" height="600" viewBox="0 0 100 150" className="drop-shadow-2xl">
                <path d="M45 10 H55 V40 H85 V50 H55 V140 H45 V50 H15 V40 H45 Z" fill="url(#crossGradient)" />
                <defs>
                    <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
             </svg>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-amber-500/10 blur-[100px] rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 md:p-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-10">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400 tracking-tight drop-shadow-sm">
                Verse of the Day
            </h1>
            
            <div className="flex items-center gap-3">
                <div className="bg-slate-900/60 backdrop-blur-md p-1 rounded-xl border border-slate-700/50 flex shadow-lg">
                    {(['english', 'telugu', 'tamil'] as const).map(lang => (
                        <button
                            key={lang}
                            onClick={() => setSelectedLang(lang)}
                            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-300 uppercase tracking-wider ${
                                selectedLang === lang 
                                ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {lang.substring(0, 2)}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setCurrentPage('home')}
                    className="p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-amber-500/30 transition-all shadow-lg group"
                >
                    <HomeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
        
        {currentVerse && (
            <div key={selectedLang} className="max-w-5xl mx-auto w-full animate-fadeInUp">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
                        <div className="absolute top-6 left-8 text-6xl font-serif text-amber-500/20 font-bold leading-none">“</div>
                        <p className={`text-2xl md:text-4xl lg:text-5xl font-serif text-white leading-relaxed md:leading-snug drop-shadow-md ${selectedLang === 'telugu' ? 'leading-loose' : ''}`}>
                            {renderSafeText(currentVerse.verse)}
                        </p>
                        <div className="absolute bottom-6 right-8 text-6xl font-serif text-amber-500/20 font-bold leading-none rotate-180">“</div>
                        <div className="mt-8 flex flex-col items-center">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-4"></div>
                            <p className="text-lg md:text-2xl text-amber-400 font-serif font-bold tracking-wide">
                                {renderSafeText(currentVerse.reference)}
                            </p>
                        </div>
                        <div className="absolute top-4 right-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowSharePopover(prev => !prev)}
                                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <ShareIcon className="h-6 w-6" />
                                </button>
                                {showSharePopover && (
                                    <SharePopover
                                        verseText={renderSafeText(currentVerse.verse)}
                                        reference={renderSafeText(currentVerse.reference)}
                                        onClose={() => setShowSharePopover(false)}
                                        position="bottom"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mt-12">
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl hover:border-amber-500/20 transition-all">
                        <h2 className="text-2xl font-serif font-bold text-amber-100 mb-4 flex items-center">
                            <span className="w-1 h-6 bg-amber-500 rounded-full mr-3"></span>
                            Spiritual Insight
                        </h2>
                        <p className="text-slate-300 text-lg leading-relaxed font-light">
                            {renderSafeText(currentVerse.explanation)}
                        </p>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl hover:border-amber-500/20 transition-all">
                        <h2 className="text-2xl font-serif font-bold text-amber-100 mb-4 flex items-center">
                            <span className="w-1 h-6 bg-amber-500 rounded-full mr-3"></span>
                            Daily Application
                        </h2>
                        <p className="text-slate-300 text-lg leading-relaxed font-light">
                            {renderSafeText(currentVerse.application)}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-green-900/30 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
                        <h3 className="text-green-400 font-bold uppercase tracking-widest text-sm mb-4 border-b border-green-500/20 pb-2">To Embrace</h3>
                        <ul className="space-y-3">
                            {currentVerse.dos.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-200">{renderSafeText(item)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-red-900/30 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                        <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm mb-4 border-b border-red-500/20 pb-2">To Avoid</h3>
                        <ul className="space-y-3">
                            {currentVerse.donts.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <XIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-200">{renderSafeText(item)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default VerseOfTheDayPage;
