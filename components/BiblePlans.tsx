
import React, { useState, useEffect } from 'react';
import { BIBLE_PLANS } from '../services/constants';
import type { BiblePlan, UserPlanProgress, Page } from '../types';
import CalendarIcon from './icons/CalendarIcon';
import CheckIcon from './icons/CheckIcon';
import HomeIcon from './icons/HomeIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface BiblePlansProps {
    setCurrentPage: (page: Page) => void;
}

const BiblePlans: React.FC<BiblePlansProps> = ({ setCurrentPage }) => {
    const [userProgress, setUserProgress] = useState<UserPlanProgress[]>([]);
    const [activeTab, setActiveTab] = useState<'browse' | 'my-plans'>('browse');

    // Load progress from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('trueHarvestUserPlans');
        if (stored) {
            try {
                setUserProgress(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load user plans", e);
            }
        }
    }, []);

    // Helper to update state and persistence
    const saveProgress = (newProgress: UserPlanProgress[]) => {
        setUserProgress(newProgress);
        localStorage.setItem('trueHarvestUserPlans', JSON.stringify(newProgress));
    };

    const handleSubscribe = (planId: string) => {
        if (userProgress.some(p => p.planId === planId)) return;
        const newPlan: UserPlanProgress = {
            planId,
            startDate: new Date().toISOString(),
            completedDays: []
        };
        saveProgress([...userProgress, newPlan]);
        setActiveTab('my-plans');
    };

    // Toggle completion status for a specific day
    const toggleDay = (e: React.MouseEvent, planId: string, day: number) => {
        e.stopPropagation(); // Prevent card click navigation
        
        const updated = userProgress.map(p => {
            if (p.planId === planId) {
                const currentCompleted = p.completedDays || [];
                const isCompleted = currentCompleted.includes(day);
                
                let newCompleted;
                if (isCompleted) {
                    newCompleted = currentCompleted.filter(d => d !== day);
                } else {
                    newCompleted = [...currentCompleted, day];
                }
                
                return { ...p, completedDays: newCompleted };
            }
            return p;
        });
        
        saveProgress(updated);
    };

    const navigateToReading = (reference: string) => {
        try {
            // 1. Extract pure reference from strings like "Title (Ref)"
            let referenceToParse = reference;
            const parenMatch = reference.match(/\((.*?)\)/);
            if (parenMatch) {
                referenceToParse = parenMatch[1];
            }

            // 2. Remove ranges like "1-5" or ":10" to get the starting chapter
            referenceToParse = referenceToParse.split(/[-:]/)[0].trim();

            // 3. Split into Book and Chapter
            const parts = referenceToParse.split(' ');
            const chapterPart = parts.pop();
            let bookPart = parts.join(' ').trim();

            if (!bookPart || !chapterPart || isNaN(parseInt(chapterPart))) {
                console.warn(`Could not parse reference: ${reference}`);
                alert(`Cannot navigate to "${reference}". Please find it in the Bible tab manually.`);
                return;
            }

            // 4. Normalize Book Abbreviations (Basic Mapping)
            const abbreviationMap: Record<string, string> = {
                'Matt': 'Matthew', 'Gen': 'Genesis', 'Ex': 'Exodus', 'Lev': 'Leviticus', 'Num': 'Numbers', 
                'Deut': 'Deuteronomy', 'Josh': 'Joshua', 'Judg': 'Judges', 'Sam': 'Samuel', 'Kgs': 'Kings', 
                'Chr': 'Chronicles', 'Neh': 'Nehemiah', 'Est': 'Esther', 'Ps': 'Psalm', 'Psa': 'Psalm', 
                'Prov': 'Proverbs', 'Ecc': 'Ecclesiastes', 'Song': 'Song of Solomon', 'Isa': 'Isaiah', 
                'Jer': 'Jeremiah', 'Lam': 'Lamentations', 'Eze': 'Ezekiel', 'Dan': 'Daniel', 'Hos': 'Hosea', 
                'Obad': 'Obadiah', 'Hab': 'Habakkuk', 'Zeph': 'Zephaniah', 'Hag': 'Haggai', 'Zech': 'Zechariah', 
                'Mal': 'Malachi', 'Rom': 'Romans', 'Cor': 'Corinthians', 'Gal': 'Galatians', 'Eph': 'Ephesians', 
                'Phil': 'Philippians', 'Col': 'Colossians', 'Thess': 'Thessalonians', 'Tim': 'Timothy', 
                'Phlm': 'Philemon', 'Heb': 'Hebrews', 'Jas': 'James', 'Pet': 'Peter', 'Rev': 'Revelation'
            };

            if (abbreviationMap[bookPart]) {
                bookPart = abbreviationMap[bookPart];
            } else {
                for (const abbr in abbreviationMap) {
                    if (bookPart.endsWith(` ${abbr}`)) {
                        bookPart = bookPart.replace(abbr, abbreviationMap[abbr]);
                        break;
                    }
                }
            }

            const chapterNum = parseInt(chapterPart, 10);

            // 5. Save Navigation Intent
            sessionStorage.setItem('trueHarvestBibleNav', JSON.stringify({
                book: bookPart,
                chapter: chapterNum
            }));

            setCurrentPage('bible');

        } catch (e) {
            console.error("Navigation parse error", e);
            alert("Could not open this reading automatically.");
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-10 max-w-6xl mx-auto relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                     <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-amber-400">
                        <CalendarIcon className="h-8 w-8" />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-3xl font-serif font-bold text-white">Bible Reading Plans</h1>
                        <p className="text-slate-400 text-sm">Stay consistent in your walk with God.</p>
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

            <div className="flex space-x-4 mb-8 border-b border-slate-700 pb-1">
                <button 
                    onClick={() => setActiveTab('browse')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'browse' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Browse Plans
                </button>
                <button 
                    onClick={() => setActiveTab('my-plans')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'my-plans' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    My Plans ({userProgress.length})
                </button>
            </div>

            {activeTab === 'browse' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {BIBLE_PLANS.map(plan => {
                        const isSubscribed = userProgress.some(p => p.planId === plan.id);
                        return (
                            <div key={plan.id} className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">
                                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${plan.imageUrl})` }}></div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold font-serif text-white mb-2">{plan.title}</h3>
                                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{plan.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full">{plan.days} Days</span>
                                        {isSubscribed ? (
                                            <button 
                                                onClick={() => setActiveTab('my-plans')}
                                                className="text-sm font-bold text-amber-400 hover:underline"
                                            >
                                                View Progress →
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleSubscribe(plan.id)}
                                                className="px-4 py-2 bg-slate-700 hover:bg-amber-500 hover:text-slate-900 text-white text-sm font-bold rounded-lg transition-colors"
                                            >
                                                Start Plan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'my-plans' && (
                <div className="space-y-8 animate-fadeIn">
                    {userProgress.length === 0 ? (
                        <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                            <p className="text-slate-400 mb-4">You haven't started any plans yet.</p>
                            <button onClick={() => setActiveTab('browse')} className="text-amber-400 font-bold hover:underline">Browse Library</button>
                        </div>
                    ) : (
                        userProgress.map(progress => {
                            const plan = BIBLE_PLANS.find(p => p.id === progress.planId);
                            if (!plan) return null;
                            const completedCount = progress.completedDays?.length || 0;
                            const percentage = Math.round((completedCount / plan.days) * 100);

                            return (
                                <div key={plan.id} className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold font-serif text-white mb-1">{plan.title}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                                                <span>{completedCount} / {plan.days} Days Completed</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 w-full md:w-64">
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>Progress</span>
                                                <span>{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                                <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                        {plan.schedule.map(day => {
                                            const isDone = (progress.completedDays || []).includes(day.day);
                                            return (
                                                <div
                                                    key={day.day}
                                                    onClick={() => navigateToReading(day.reference)}
                                                    className={`
                                                        relative p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer group
                                                        ${isDone 
                                                            ? 'bg-amber-500/10 border-amber-500/30' 
                                                            : 'bg-slate-900/50 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800'
                                                        }
                                                    `}
                                                    title="Click to Read"
                                                >
                                                    {/* Hover Read Indicator */}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        <span className="text-xs font-bold text-white flex items-center">
                                                            <BookOpenIcon className="h-4 w-4 mr-1" /> Read
                                                        </span>
                                                    </div>

                                                    <div className={`text-xs font-bold uppercase mb-1 z-0 ${isDone ? 'text-amber-400' : 'text-slate-400'}`}>Day {day.day}</div>
                                                    <div className="text-xs text-center truncate w-full px-1 mb-2 text-slate-300 z-0">{day.reference}</div>
                                                    
                                                    {/* Checkbox Button */}
                                                    <button 
                                                        onClick={(e) => toggleDay(e, plan.id, day.day)}
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all z-20 hover:scale-110 ${
                                                            isDone 
                                                                ? 'bg-amber-500 border-amber-500 text-slate-900' 
                                                                : 'border-slate-600 bg-slate-800 hover:border-amber-500'
                                                        }`}
                                                        title={isDone ? "Mark as Incomplete" : "Mark as Complete"}
                                                    >
                                                        {isDone && <CheckIcon className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default BiblePlans;
