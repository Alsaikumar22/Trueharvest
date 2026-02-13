
import React, { useState, useEffect, useMemo } from 'react';
import type { Page, DailyLog } from '../types';
import HomeIcon from './icons/HomeIcon';
import CheckIcon from './icons/CheckIcon';
import BibleIcon from './icons/BibleIcon';
import InspirationIcon from './icons/InspirationIcon';
import MusicIcon from './icons/MusicIcon';
import GraphIcon from './icons/GraphIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import SparklesIcon from './icons/SparklesIcon';
import { analyzeJournalEntry, JournalAnalysis } from '../services/geminiService';

interface IntrospectionPageProps {
    setCurrentPage: (page: Page) => void;
}

const STORAGE_KEY = 'trueHarvestDailyLogs';

const IntrospectionPage: React.FC<IntrospectionPageProps> = ({ setCurrentPage }) => {
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [logs, setLogs] = useState<Record<string, DailyLog>>({});
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    
    // AI Journal State
    const [journalText, setJournalText] = useState('');
    const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setLogs(JSON.parse(stored));
    }, []);

    const currentLog: DailyLog = logs[selectedDate] || {
        date: selectedDate,
        readBible: false,
        readVerse: false,
        prayed: false,
        worship: false,
        peaceScore: 5,
        minutesSpent: 0
    };

    const saveLog = (updatedLog: DailyLog) => {
        const updatedLogs = { ...logs, [updatedLog.date]: updatedLog };
        setLogs(updatedLogs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    };

    const toggleHabit = (habit: keyof Omit<DailyLog, 'date' | 'peaceScore' | 'minutesSpent'>) => {
        saveLog({ ...currentLog, [habit]: !currentLog[habit] });
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        saveLog({ ...currentLog, peaceScore: parseInt(e.target.value) });
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        saveLog({ ...currentLog, minutesSpent: parseInt(e.target.value) || 0 });
    };

    const handleAnalyzeJournal = async () => {
        if (!journalText.trim()) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        try {
            const result = await analyzeJournalEntry(journalText);
            setAnalysis(result);
        } catch (e) {
            alert("Analysis failed. Please check your connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); 
        const days = [];
        for (let i = 0; i < startDayOfWeek; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push(dateStr);
        }
        return days;
    };

    const changeMonth = (offset: number) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    // Chart Data for last 7 days
    const weeklyData = useMemo(() => {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            data.push({
                day: d.toLocaleDateString(undefined, { weekday: 'short' }),
                minutes: logs[dStr]?.minutesSpent || 0
            });
        }
        return data;
    }, [logs]);

    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60);

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-4 md:p-10 max-w-6xl mx-auto relative overflow-hidden animate-fadeInUp min-h-[85vh]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-amber-400">
                        <GraphIcon className="h-8 w-8" />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-3xl font-serif font-bold text-white">Your Sanctuary Log</h1>
                        <p className="text-slate-400 text-sm">Growth comes from consistent seeds sown in the spirit.</p>
                    </div>
                </div>
                <button
                    onClick={() => setCurrentPage('home')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <HomeIcon className="h-5 w-5" />
                    <span className="font-semibold text-sm hidden md:block">Home</span>
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    {/* Time with God Chart */}
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white font-serif mb-6 flex items-center">
                             <div className="w-1.5 h-6 bg-amber-500 rounded-full mr-3"></div>
                             Time Spent with God (Last 7 Days)
                        </h3>
                        <div className="flex items-end justify-between h-48 gap-2">
                             {weeklyData.map((d, i) => (
                                 <div key={i} className="flex-1 flex flex-col items-center">
                                     <div className="w-full bg-slate-900 rounded-t-lg relative group flex flex-col justify-end" style={{ height: '100%' }}>
                                         <div 
                                            className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all duration-700 relative"
                                            style={{ height: `${(d.minutes / maxMinutes) * 100}%` }}
                                         >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-950 px-2 py-1 rounded text-[10px] text-white font-bold whitespace-nowrap transition-opacity">
                                                {d.minutes} mins
                                            </div>
                                         </div>
                                     </div>
                                     <span className="text-[10px] text-slate-500 font-bold uppercase mt-3">{d.day}</span>
                                 </div>
                             ))}
                        </div>
                    </div>

                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white font-serif">
                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex space-x-2">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                                    <ChevronDownIcon className="h-5 w-5 rotate-90" />
                                </button>
                                <button onClick={() => setViewDate(new Date())} className="text-xs font-bold text-amber-500 uppercase tracking-wider px-2 hover:text-amber-400">Today</button>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                                    <ChevronDownIcon className="h-5 w-5 -rotate-90" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {getCalendarDays().map((dateStr, index) => {
                                if (!dateStr) return <div key={`empty-${index}`} className="aspect-square"></div>;
                                const dayNum = parseInt(dateStr.split('-')[2]);
                                const isSelected = dateStr === selectedDate;
                                const isToday = dateStr === todayStr;
                                const log = logs[dateStr];
                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 border ${isSelected ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-900/30 border-slate-700/50 hover:bg-slate-800'}`}
                                    >
                                        <span className={`text-sm font-medium ${isToday ? 'text-amber-400 font-bold' : isSelected ? 'text-white' : 'text-slate-400'}`}>{dayNum}</span>
                                        {log && (
                                            <div className="absolute bottom-2 flex space-x-0.5">
                                                {log.readVerse && <div className="w-1 h-1 rounded-full bg-blue-400"></div>}
                                                {log.readBible && <div className="w-1 h-1 rounded-full bg-emerald-400"></div>}
                                                {log.prayed && <div className="w-1 h-1 rounded-full bg-purple-400"></div>}
                                                {log.worship && <div className="w-1 h-1 rounded-full bg-pink-400"></div>}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-800/40 p-6 md:p-8 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700/50">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-serif">{selectedDate === todayStr ? "Today's Record" : "Edit Log"}</h2>
                                <p className="text-slate-400 text-sm mt-1">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                                <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Minutes with God</label>
                                <div className="flex items-center space-x-4">
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={currentLog.minutesSpent}
                                        onChange={handleMinutesChange}
                                        className="w-24 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-bold"
                                    />
                                    <span className="text-slate-400">minutes today</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => toggleHabit('readVerse')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 ${currentLog.readVerse ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700'}`}>
                                    <InspirationIcon className="h-6 w-6" /><span className="font-bold text-xs">Verse</span>
                                </button>
                                <button onClick={() => toggleHabit('readBible')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 ${currentLog.readBible ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700'}`}>
                                    <BibleIcon className="h-6 w-6" /><span className="font-bold text-xs">Bible</span>
                                </button>
                                <button onClick={() => toggleHabit('worship')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 ${currentLog.worship ? 'bg-pink-500/20 text-pink-300 border-pink-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700'}`}>
                                    <MusicIcon className="h-6 w-6" /><span className="font-bold text-xs">Worship</span>
                                </button>
                                <button onClick={() => toggleHabit('prayed')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 ${currentLog.prayed ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700'}`}>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="font-bold text-xs">Prayer</span>
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-700/50">
                                <div className="flex justify-between mb-4"><label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Spiritual Peace</label><span className="text-lg font-bold text-amber-400 font-serif">{currentLog.peaceScore}/10</span></div>
                                <input type="range" min="1" max="10" value={currentLog.peaceScore} onChange={handleSliderChange} className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-amber-500" />
                            </div>
                        </div>
                    </div>

                    {/* AI Journaling Section - NLP Showcase */}
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white font-serif flex items-center">
                                <SparklesIcon className="h-5 w-5 text-amber-500 mr-2" />
                                Spiritual Journal
                            </h3>
                            <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded uppercase tracking-wider">AI Powered</span>
                        </div>
                        
                        {!analysis ? (
                            <div className="space-y-3">
                                <textarea
                                    value={journalText}
                                    onChange={(e) => setJournalText(e.target.value)}
                                    placeholder="How is your spirit today? Write your thoughts..."
                                    className="w-full h-24 p-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none resize-none placeholder:text-slate-500"
                                />
                                <button
                                    onClick={handleAnalyzeJournal}
                                    disabled={isAnalyzing || !journalText}
                                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg disabled:opacity-50"
                                >
                                    {isAnalyzing ? "Analyzing Sentiment..." : "Analyze Spirit"}
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fadeIn space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                    <span className="text-xs text-slate-400 uppercase tracking-widest">Detected Emotion</span>
                                    <span className="text-sm font-bold text-indigo-400 capitalize">{analysis.emotion}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Prescription Verse</p>
                                    <p className="text-white font-serif italic text-sm">"{analysis.comfort_verse}"</p>
                                    <p className="text-amber-500 text-xs font-bold mt-1 text-right">— {analysis.reference}</p>
                                </div>
                                <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                                    <p className="text-xs text-indigo-300 font-medium">
                                        <span className="font-bold">Prayer Strategy:</span> {analysis.prayer_strategy}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setAnalysis(null); setJournalText(''); }}
                                    className="text-xs text-slate-500 hover:text-white w-full text-center mt-2 underline"
                                >
                                    New Entry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntrospectionPage;
