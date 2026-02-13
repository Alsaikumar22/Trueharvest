
import React, { useState } from 'react';
import { generateBibleStudy } from '../services/geminiService';
import type { Page } from '../types';
import InspirationIcon from './icons/InspirationIcon';
import HomeIcon from './icons/HomeIcon';
import SearchIcon from './icons/SearchIcon';
import SparklesIcon from './icons/SparklesIcon';

interface BibleStudyProps {
    setCurrentPage: (page: Page) => void;
}

const BibleStudy: React.FC<BibleStudyProps> = ({ setCurrentPage }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleStudy = async (preset?: string) => {
        const finalQuery = preset || query;
        if (!finalQuery.trim()) return;
        setIsLoading(true);
        setResult('');
        const response = await generateBibleStudy(finalQuery);
        setResult(response);
        setIsLoading(false);
    };

    const examples = [
        "What does 'Shalom' mean in Hebrew?",
        "Explain the parable of the Talents",
        "Thematic study on Anxiety in Psalms",
        "Significance of the burning bush",
        "Compare Moses and Christ",
        "Explain Covenant in the OT"
    ];

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl p-6 md:p-10 max-w-6xl mx-auto relative overflow-hidden min-h-[85vh] flex flex-col">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex items-center">
                    <div className="p-4 bg-slate-800 rounded-3xl border border-slate-700 text-amber-400 shadow-2xl">
                        <SearchIcon className="h-8 w-8" />
                    </div>
                    <div className="ml-5">
                        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Theological Query</h1>
                        <p className="text-slate-400 text-sm italic font-serif">Bridging the gap between reading and understanding.</p>
                    </div>
                </div>
                <button
                    onClick={() => setCurrentPage('home')}
                    className="flex items-center space-x-2 px-6 py-3 rounded-full text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all shadow-lg active:scale-95"
                >
                    <HomeIcon className="h-5 w-5" />
                    <span className="font-bold text-sm hidden md:block uppercase tracking-widest">Home</span>
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 flex-grow overflow-hidden">
                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
                    <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl">
                        <div className="absolute -top-6 -right-6 text-amber-500/5 font-serif text-[12rem] font-bold select-none italic">?</div>
                        <h3 className="text-amber-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 flex items-center">
                            <SparklesIcon className="h-4 w-4 mr-2" /> Digital Companion
                        </h3>
                        <h2 className="text-3xl font-serif font-bold text-white mb-4 leading-tight">Digital Bible Scholar</h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-8 font-medium opacity-90">
                            We kept this tool to act as your digital sanctuary research assistant. It explores theological nuances that search engines miss.
                        </p>
                        
                        <div className="space-y-6">
                            {[
                                { title: "Word Origins", desc: "Uncover Greek or Hebrew roots of key terms." },
                                { title: "Historical Context", desc: "First-century Jewish customs explained." },
                                { title: "Cross References", desc: "Thematic links across both testaments." }
                            ].map((item, i) => (
                                <div key={i} className="group border-l-2 border-amber-500/30 pl-5 py-1 hover:border-amber-400 transition-colors">
                                    <strong className="block text-white text-xs uppercase tracking-[0.15em] mb-1">{item.title}</strong>
                                    <p className="text-slate-400 text-[11px] leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Quick Research Topics</h3>
                         <div className="grid grid-cols-1 gap-2.5">
                             {examples.map((ex, i) => (
                                 <button 
                                    key={i} 
                                    onClick={() => handleStudy(ex)}
                                    className="text-left px-5 py-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-md active:scale-[0.98]"
                                 >
                                     "{ex}"
                                 </button>
                             ))}
                         </div>
                    </div>
                </div>

                {/* Main Content Hub */}
                <div className="lg:col-span-8 flex flex-col h-full bg-slate-950/60 rounded-[3rem] border border-slate-800 p-8 shadow-inner relative">
                    <div className="flex-grow overflow-y-auto custom-scrollbar mb-8 pr-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-6 animate-pulse">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"></div>
                                    <div className="absolute inset-0 m-auto h-4 w-4 bg-amber-500 rounded-full"></div>
                                </div>
                                <p className="text-amber-500 font-serif italic text-xl">Consulting the ancient scrolls...</p>
                            </div>
                        ) : result ? (
                            <div className="prose prose-invert prose-lg max-w-none animate-fadeIn">
                                <div className="text-slate-200 leading-relaxed font-serif whitespace-pre-wrap text-xl md:text-2xl tracking-tight mb-12 border-b border-slate-800/50 pb-12">
                                    {result}
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={() => setResult('')} className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] hover:text-amber-500 transition-colors py-4 border-t border-slate-800 w-full">Start New Theological Research</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                <div className="p-10 bg-slate-900 rounded-[3rem] mb-8 border border-slate-800 shadow-2xl">
                                    <InspirationIcon className="h-20 w-20 text-slate-700" />
                                </div>
                                <h3 className="text-3xl font-serif font-bold text-slate-400 mb-3">Sow a Seed of Inquiry</h3>
                                <p className="text-sm text-slate-600 max-w-sm mx-auto font-medium">Your question leads to deeper roots. Type a theological query below to begin your study.</p>
                            </div>
                        )}
                    </div>

                    {/* Input Hub */}
                    <div className="relative flex-shrink-0 mt-auto">
                         <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-5 pointer-events-none"></div>
                         <div className="relative flex gap-4">
                             <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleStudy()}
                                placeholder="Search the depth of the Word..."
                                className="flex-grow px-8 py-6 bg-slate-900 border border-slate-700 text-white rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-lg font-serif shadow-2xl"
                            />
                            <button
                                onClick={() => handleStudy()}
                                disabled={isLoading || !query}
                                className="px-12 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-[2rem] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl active:scale-95 uppercase tracking-[0.2em] text-xs"
                            >
                                Research
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BibleStudy;
