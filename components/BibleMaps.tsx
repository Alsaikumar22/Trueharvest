
import React, { useState } from 'react';
import { generateBibleMapInfo } from '../services/geminiService';
import type { Page } from '../types';
import MapIcon from './icons/MapIcon';
import HomeIcon from './icons/HomeIcon';
import SearchIcon from './icons/SearchIcon';
import LinkIcon from './icons/LinkIcon';

interface BibleMapsProps {
    setCurrentPage: (page: Page) => void;
}

const BibleMaps: React.FC<BibleMapsProps> = ({ setCurrentPage }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<{ text: string, chunks: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mapUrl, setMapUrl] = useState<string | null>(null);

    const presets = [
        "Paul's First Missionary Journey",
        "The Exodus Route from Egypt",
        "The 12 Tribes of Israel",
        "Jesus' Ministry in Galilee",
        "The Seven Churches of Revelation",
        "Ancient Jerusalem (City of David)",
        "Garden of Eden (Possible Locations)",
        "The Journey of the Ark of the Covenant"
    ];

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setResult(null);
        setMapUrl(null);
        
        // 1. Generate Content & Grounding Links
        const data = await generateBibleMapInfo(searchQuery);
        setResult(data);

        // 2. Construct Map Embed URL
        // We use the Embed API in 'search' mode to find the relevant place.
        // Note: This relies on the API Key having "Maps Embed API" enabled in Google Cloud Console.
        const encodedQuery = encodeURIComponent(searchQuery + " bible map location");
        setMapUrl(`https://www.google.com/maps/embed/v1/search?key=${process.env.API_KEY}&q=${encodedQuery}&zoom=6&maptype=satellite`);
        
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl p-6 md:p-10 max-w-6xl mx-auto relative overflow-hidden min-h-[85vh] flex flex-col">
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10">
                <div className="flex items-center">
                    <div className="p-4 bg-slate-800 rounded-3xl border border-slate-700 text-blue-400 shadow-2xl">
                        <MapIcon className="h-8 w-8" />
                    </div>
                    <div className="ml-5">
                        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Sacred Geography</h1>
                        <p className="text-slate-400 text-sm italic font-serif">Explore the lands of the Bible with Google Maps.</p>
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

            {/* Search Bar */}
            <div className="relative z-10 mb-8">
                <div className="flex bg-slate-800/50 border border-slate-600 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-xl">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                        placeholder="Search for a biblical location or event..."
                        className="flex-grow px-6 py-4 bg-transparent text-white placeholder-slate-400 outline-none text-lg"
                    />
                    <button 
                        onClick={() => handleSearch(query)}
                        className="px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center gap-2"
                    >
                        <SearchIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Explore</span>
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 flex-grow overflow-hidden relative z-10">
                {/* Sidebar: Presets */}
                <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2 h-full max-h-[600px]">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Famous Maps</h3>
                    <div className="grid gap-3">
                        {presets.map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setQuery(preset); handleSearch(preset); }}
                                className="text-left p-4 rounded-xl bg-slate-800/40 border border-slate-700 hover:bg-slate-700 hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-blue-500/10"
                            >
                                <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{preset}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content: Results */}
                <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-slate-950/50 rounded-3xl border border-slate-800 p-6 shadow-inner relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 animate-pulse">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"></div>
                                <MapIcon className="absolute inset-0 m-auto h-6 w-6 text-blue-500" />
                            </div>
                            <p className="text-blue-400 font-serif italic text-xl">Charting the course...</p>
                        </div>
                    ) : result ? (
                        <div className="flex flex-col h-full space-y-6 overflow-y-auto custom-scrollbar pr-2">
                            {/* Map View - Embedded directly */}
                            {mapUrl && (
                                <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative bg-slate-900 flex-shrink-0">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={mapUrl}
                                        title="Biblical Map View"
                                        className="opacity-90 hover:opacity-100 transition-opacity"
                                    ></iframe>
                                    <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-slate-300 pointer-events-none">
                                        Satellite View
                                    </div>
                                </div>
                            )}

                            {/* Text Content */}
                            <div className="prose prose-invert max-w-none">
                                <h2 className="text-2xl font-serif font-bold text-white mb-4 border-b border-slate-800 pb-2">
                                    Historical Context: {query}
                                </h2>
                                <div className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                                    {result.text}
                                </div>
                            </div>

                            {/* Google Maps Links / Grounding Data */}
                            {result.chunks && result.chunks.length > 0 && (
                                <div className="mt-4 pt-6 border-t border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                        <MapIcon className="h-4 w-4 mr-2" /> Specific Locations (Source Data)
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {result.chunks.map((chunk: any, i: number) => {
                                            const uri = chunk.web?.uri || chunk.maps?.uri;
                                            const title = chunk.web?.title || chunk.maps?.title || "View on Google Maps";
                                            
                                            if (!uri) return null;

                                            return (
                                                <a 
                                                    key={i} 
                                                    href={uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-slate-800 transition-all group"
                                                >
                                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mr-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                        <LinkIcon className="h-4 w-4" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <span className="block font-bold text-white text-sm group-hover:text-blue-300 transition-colors truncate">{title}</span>
                                                        <span className="text-[10px] text-slate-500 truncate block opacity-70">Open in Maps App</span>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                            <MapIcon className="h-24 w-24 text-slate-700 mb-6" />
                            <h3 className="text-2xl font-serif font-bold text-slate-400 mb-2">Discover Sacred Lands</h3>
                            <p className="text-slate-500 max-w-sm">Select a famous map from the list or search for any location to view an interactive map and historical data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BibleMaps;
