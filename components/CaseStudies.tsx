
import React, { useState } from 'react';
import { generateCaseStudy } from '../services/geminiService';
import type { Page } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import HomeIcon from './icons/HomeIcon';

interface CaseStudiesProps {
    setCurrentPage: (page: Page) => void;
}

const suggestedTopics = [
    "David vs Goliath",
    "Peter's Denial",
    "The Woman at the Well",
    "Paul's Conversion",
    "Daniel in the Lions' Den",
    "Esther Saving Her People",
    "The Prodigal Son"
];

const CaseStudies: React.FC<CaseStudiesProps> = ({ setCurrentPage }) => {
    const [topic, setTopic] = useState('');
    const [studyData, setStudyData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async (selectedTopic: string = topic) => {
        if (!selectedTopic.trim()) return;
        setIsLoading(true);
        setStudyData(null);
        try {
            const data = await generateCaseStudy(selectedTopic);
            setStudyData(data);
        } catch (e) {
            console.error(e);
            alert("Failed to generate case study. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-10 max-w-5xl mx-auto relative overflow-hidden min-h-[calc(100vh-8rem)]">
             <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-amber-400">
                        <BookOpenIcon className="h-8 w-8" />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-3xl font-serif font-bold text-white">Biblical Case Studies</h1>
                        <p className="text-slate-400 text-sm">Deep dive into characters and events.</p>
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

            {!studyData && !isLoading && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">Choose a Topic</h3>
                        <div className="flex flex-wrap gap-3">
                            {suggestedTopics.map(t => (
                                <button 
                                    key={t}
                                    onClick={() => { setTopic(t); handleGenerate(t); }}
                                    className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-full text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-all"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Or enter any character or event (e.g., 'Samson')..."
                            className="flex-grow px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                        <button 
                            onClick={() => handleGenerate()}
                            className="px-6 py-3 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-colors"
                        >
                            Analyze
                        </button>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                     <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-6"></div>
                     <p className="text-xl font-serif text-slate-300">Analyzing Scriptures & History...</p>
                </div>
            )}

            {studyData && (
                <div className="animate-fadeInUp space-y-8">
                     <button onClick={() => setStudyData(null)} className="text-amber-400 hover:underline mb-4">← Analyze Another</button>
                     
                     <div className="border-l-4 border-amber-500 pl-6">
                        <h2 className="text-4xl font-serif font-bold text-white mb-2">{studyData.title}</h2>
                        <p className="text-xl text-slate-400 italic">{studyData.scripture_reference}</p>
                     </div>

                     <div className="grid md:grid-cols-2 gap-8">
                         <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                             <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3">Context & Background</h3>
                             <p className="text-slate-300 leading-relaxed">{studyData.background}</p>
                         </div>
                         <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                             <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3">Significance</h3>
                             <p className="text-slate-300 leading-relaxed">{studyData.significance}</p>
                         </div>
                     </div>

                     <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                         <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-4">Key Events</h3>
                         <ul className="space-y-2">
                             {studyData.key_events.map((event: string, i: number) => (
                                 <li key={i} className="flex items-start">
                                     <span className="bg-slate-700 text-slate-300 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0">{i+1}</span>
                                     <span className="text-slate-300">{event}</span>
                                 </li>
                             ))}
                         </ul>
                     </div>
                     
                     <div className="bg-gradient-to-br from-amber-900/20 to-slate-900 p-6 rounded-2xl border border-amber-500/30">
                         <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-4">Lessons for Today</h3>
                         <ul className="space-y-3">
                             {studyData.lessons.map((lesson: string, i: number) => (
                                 <li key={i} className="flex items-start">
                                     <div className="mt-1 mr-3 w-2 h-2 bg-amber-500 rounded-full"></div>
                                     <span className="text-white text-lg">{lesson}</span>
                                 </li>
                             ))}
                         </ul>
                     </div>

                     <div className="p-6 text-center border-t border-slate-800">
                         <p className="text-slate-400 font-serif italic text-xl">"{studyData.reflection_question}"</p>
                     </div>
                </div>
            )}
        </div>
    );
};

export default CaseStudies;
