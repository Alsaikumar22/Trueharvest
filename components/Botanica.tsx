
import React, { useState, useEffect } from 'react';
import { getCharacterProfile } from '../services/geminiService';
import { updateMetadata } from '../services/seoService';
import type { Page, CharacterProfile } from '../types';
import Logo from './Logo';
import HomeIcon from './icons/HomeIcon';
import SearchIcon from './icons/SearchIcon';
import StarIcon from './icons/StarIcon';
import LeafIcon from './icons/LeafIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface BotanicaProps {
    setCurrentPage: (page: Page) => void;
}

const Botanica: React.FC<BotanicaProps> = ({ setCurrentPage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [language, setLanguage] = useState('english');
    const [characters, setCharacters] = useState<CharacterProfile[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories = ["Kings", "Prophets", "Men", "Women", "Disciples", "Judges", "Priests", "People Group"];
    const [activeCategory, setActiveCategory] = useState("Men");

    const placeholders: Record<string, string> = {
        english: "Search biblical characters (e.g. Abraham, David)...",
        telugu: "బైబిల్ పాత్రలను వెతకండి (ఉదా. అబ్రాహాము, దావీదు)...",
        tamil: "விவிலிய கதாபாத்திரங்களைத் தேடுங்கள் (எ.கா. ஆபிரகாம், தாவீது)..."
    };

    useEffect(() => {
        updateMetadata(
            "Biblical Characters (Botanica)",
            "Discover the stories, origins, and legacies of biblical figures like David, Moses, and Esther in the True Harvest Botanica garden.",
            "/?page=botanica"
        );
    }, []);

    const handlePlantSeed = async () => {
        if (!searchTerm.trim()) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const existing = characters.find(c => c.name.toLowerCase() === searchTerm.toLowerCase());
            if (existing) {
                setSelectedCharacter(existing);
                setIsLoading(false);
                return;
            }

            const profile = await getCharacterProfile(searchTerm, language);
            setCharacters(prev => [profile, ...prev]);
            setSelectedCharacter(profile);
            // Don't clear search term so user remembers who they looked up
        } catch (e) {
            console.error(e);
            setError("Could not find this character. Please try another name.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#022c22] min-h-[calc(100vh-6rem)] w-full rounded-3xl p-6 md:p-10 relative overflow-hidden font-sans">
             {/* Deep Green Theme Background */}
             <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] to-[#022c22] opacity-50"></div>
             
             {/* Top Bar */}
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-5xl font-serif font-bold text-[#fcd34d]">Botanica</h1>
                    <p className="text-slate-300 text-lg tracking-wide">A Garden of Biblical Characters</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setCurrentPage('video')}
                        className="bg-[#fcd34d] hover:bg-[#fbbf24] text-[#064e3b] px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg"
                    >
                        Create a Video
                    </button>
                    <button 
                        onClick={() => setCurrentPage('home')}
                        className="bg-[#064e3b]/50 hover:bg-[#064e3b] text-slate-300 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors border border-[#065f46]"
                    >
                        Home
                    </button>
                </div>
             </div>

             {/* Filters */}
             <div className="relative z-10 flex flex-wrap gap-3 mb-8">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                            activeCategory === cat 
                            ? 'bg-[#fcd34d] text-[#064e3b]' 
                            : 'bg-[#064e3b] text-slate-300 hover:bg-[#065f46]'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
             </div>

             {/* Search Bar */}
             <div className="relative z-10 mb-12 max-w-4xl">
                <div className="relative flex items-center bg-[#064e3b]/40 border border-[#065f46] rounded-xl overflow-hidden shadow-2xl">
                    {/* Language Select (Integrated subtly) */}
                    <div className="pl-2 border-r border-[#065f46]">
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent text-slate-400 text-sm font-bold py-4 pl-2 pr-1 outline-none cursor-pointer hover:text-white"
                        >
                            <option value="english">EN</option>
                            <option value="telugu">TE</option>
                            <option value="tamil">TA</option>
                        </select>
                    </div>

                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePlantSeed()}
                        placeholder={placeholders[language] || placeholders.english}
                        className="flex-grow px-6 py-5 bg-transparent text-white text-lg focus:outline-none placeholder:text-slate-500"
                    />
                    
                    <div className="pr-2">
                        <button 
                            onClick={handlePlantSeed}
                            disabled={isLoading}
                            className="bg-[#fcd34d] hover:bg-[#fbbf24] text-[#064e3b] px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="animate-spin h-5 w-5 border-2 border-[#064e3b] border-t-transparent rounded-full"></span>
                            ) : (
                                <SearchIcon className="h-5 w-5" />
                            )}
                            Search
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-400 mt-2 ml-1">{error}</p>}
             </div>

             {/* Content Area */}
             <div className="relative z-10">
                {selectedCharacter ? (
                    <div className="bg-[#064e3b]/30 border border-[#065f46] rounded-3xl p-8 md:p-12 animate-fadeInUp shadow-2xl">
                        <div className="grid lg:grid-cols-12 gap-12 items-start">
                            
                            {/* Left Column: Image & Identity */}
                            <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left">
                                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#065f46] mb-6 group">
                                    {/* Placeholder Image - Using a generic stylistic placeholder since we can't gen specific faces reliably without image model calls here */}
                                    <img 
                                        src="https://images.unsplash.com/photo-1599827092520-22c6686a347e?q=80&w=2664&auto=format&fit=crop" 
                                        alt={selectedCharacter.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 sepia-[0.3]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] to-transparent opacity-60"></div>
                                </div>
                                
                                <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-2">{selectedCharacter.name}</h2>
                                
                                <div className="flex items-center gap-3 mb-6">
                                    <StarIcon className="h-6 w-6 text-[#fcd34d]" />
                                    <LeafIcon className="h-6 w-6 text-emerald-400" />
                                    <span className="text-emerald-400/50">|</span>
                                    <span className="text-emerald-300 font-mono text-sm">{selectedCharacter.scripture_ref}</span>
                                </div>

                                <p className="text-[#fcd34d] font-serif italic text-xl leading-relaxed opacity-90 border-l-2 border-[#fcd34d] pl-4">
                                    "{selectedCharacter.tagline}"
                                </p>
                            </div>

                            {/* Right Column: Details & Circles */}
                            <div className="lg:col-span-8">
                                {/* The Three Circles */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative">
                                    {/* Connecting Line (Desktop) */}
                                    <div className="hidden md:block absolute top-8 left-16 right-16 h-px bg-[#065f46] -z-10"></div>

                                    {[
                                        { icon: <BookOpenIcon className="h-8 w-8"/>, title: selectedCharacter.plant_type, label: "Identity" },
                                        { icon: <BookOpenIcon className="h-8 w-8"/>, title: selectedCharacter.origin, label: "Origin" },
                                        { icon: <BookOpenIcon className="h-8 w-8"/>, title: selectedCharacter.key_fruit, label: "Legacy" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-[#022c22] border-2 border-[#fcd34d] flex items-center justify-center text-[#fcd34d] mb-4 shadow-lg z-10">
                                                {item.icon}
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-300 mb-1">{item.title}</h4>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#065f46]">{item.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Text Content */}
                                <div className="bg-[#022c22]/50 p-8 rounded-2xl border border-[#065f46]">
                                    <h3 className="text-3xl font-serif font-bold text-white mb-6">
                                        {selectedCharacter.plant_type}
                                    </h3>
                                    <p className="text-slate-300 text-lg leading-loose font-serif">
                                        {selectedCharacter.growth_story}
                                    </p>
                                    
                                    <div className="mt-8 pt-6 border-t border-[#065f46] flex flex-col md:flex-row gap-6">
                                        <div>
                                            <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-2">Thorns & Struggles</span>
                                            <p className="text-slate-400">{selectedCharacter.thorns}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <LeafIcon className="h-32 w-32 text-[#065f46] mb-6" />
                        <p className="text-2xl font-serif text-[#065f46]">Select a character to view their profile.</p>
                    </div>
                )}
             </div>
        </div>
    );
};

export default Botanica;
