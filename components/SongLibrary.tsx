
import React, { useState, useMemo, useEffect } from 'react';
import { SONG_DATA } from '../services/constants';
import { fetchSongsFromFirestore } from '../services/firebaseService';
import { updateMetadata } from '../services/seoService';
import type { Song, Page } from '../types';
import SongCard from './SongCard';
import SearchIcon from './icons/SearchIcon';
import MusicIcon from './icons/MusicIcon';
import HomeIcon from './icons/HomeIcon';
import HeartIcon from './icons/HeartIcon';
import XIcon from './icons/XIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

const LIKED_SONGS_KEY = 'trueHarvestLikedSongIds';

interface SongLibraryProps {
    setCurrentPage: (page: Page) => void;
    onSongSelect: (songId: string) => void;
}

// --- Levenshtein Distance for Fuzzy Matching ---
const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    let i, j;
    for (i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
};

const SongLibrary: React.FC<SongLibraryProps> = ({ setCurrentPage, onSongSelect }) => {
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLetter, setFilterLetter] = useState<string>('All');
    const [showLikedOnly, setShowLikedOnly] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['English', 'Telugu', 'Tamil', 'Hindi']));

    // Dynamic SEO
    useEffect(() => {
        updateMetadata(
            "Christian Worship Songs & Lyrics",
            "Explore the True Harvest collection of Christian hymns, contemporary worship songs, and lyrics in English, Telugu, and Tamil. Lift your spirit with praise.",
            "/?page=songs"
        );
    }, []);

    // Load Data
    useEffect(() => {
        // 1. Load Liked
        try {
            const storedLikes = localStorage.getItem(LIKED_SONGS_KEY);
            if (storedLikes) {
                const parsedData = JSON.parse(storedLikes);
                if (Array.isArray(parsedData)) {
                    setLikedIds(new Set(parsedData));
                }
            }
        } catch (error) {
            console.error("Could not load liked songs", error);
        }

        // 2. Fetch Songs
        const loadSongs = async () => {
            setIsLoading(true);
            try {
                const cloudSongs = await fetchSongsFromFirestore();
                let songsToSet: Song[] = [];

                if (cloudSongs.length > 0) {
                    songsToSet = cloudSongs;
                } else {
                    // Fallback to static data
                    songsToSet = Object.values(SONG_DATA).flatMap(catMap => 
                        Object.values(catMap).flat()
                    );
                }
                setAllSongs(songsToSet);
                
                // Default expand all languages present
                const languages = new Set(songsToSet.map(s => s.language));
                setExpandedSections(languages);

            } catch (e) {
                console.error("Failed to load songs", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadSongs();
    }, []);
    
    // Persist Likes
    useEffect(() => {
        try {
            localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(Array.from(likedIds)));
        } catch (error) {
            console.error("Could not save liked songs", error);
        }
    }, [likedIds]);

    const handleToggleLike = (song: Song) => {
        const songId = song.id || `${song.title}-${song.artist}`;
        setLikedIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(songId)) newIds.delete(songId);
            else newIds.add(songId);
            return newIds;
        });
    };

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        if (val) setFilterLetter('All');
    };

    const handleLetterClick = (letter: string) => {
        setFilterLetter(letter);
        setSearchTerm('');
        // Optional: Scroll to top of list
        const container = document.getElementById('songs-container');
        if (container) container.scrollTop = 0;
    };

    const toggleSection = (lang: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lang)) newSet.delete(lang);
            else newSet.add(lang);
            return newSet;
        });
    };

    const alphabet = useMemo(() => ['All', '#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')], []);

    // --- SEARCH & FILTER LOGIC ---
    const filteredFlatList = useMemo(() => {
        let result = allSongs;

        // 1. Filter by Liked
        if (showLikedOnly) {
            result = result.filter(song => {
                const id = song.id || `${song.title}-${song.artist}`;
                return likedIds.has(id);
            });
        }

        // 2. Filter by Letter Index
        if (filterLetter !== 'All' && !searchTerm) {
            result = result.filter(song => {
                const firstChar = song.title.charAt(0).toUpperCase();
                if (filterLetter === '#') {
                    return !/[A-Z]/.test(firstChar);
                }
                return firstChar === filterLetter;
            });
        }

        // 3. Search Logic
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase().trim();
            // Scoring logic
            const scoredSongs = result.map(song => {
                let score = 0;
                const titleLower = song.title.toLowerCase();
                const artistLower = song.artist.toLowerCase();
                const englishLyricsLower = (song.englishLyrics || "").toLowerCase();
                const nativeLyricsLower = song.lyrics.toLowerCase();

                if (titleLower === query) score += 100;
                else if (titleLower.startsWith(query)) score += 80;
                else if (titleLower.includes(query)) score += 60;
                else if (englishLyricsLower.includes(query)) score += 50;
                else {
                    const dist = levenshteinDistance(titleLower, query);
                    if (dist <= 3 && titleLower.length > 4) {
                        score += 40 - (dist * 5);
                    }
                }
                if (artistLower.includes(query)) score += 30;
                if (nativeLyricsLower.includes(query)) score += 10;

                return { song, score };
            });

            return scoredSongs
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(item => item.song);
        }

        // Default Sort: Alphabetical
        return result.sort((a, b) => a.title.localeCompare(b.title));

    }, [allSongs, showLikedOnly, searchTerm, filterLetter, likedIds]);

    // --- GROUP BY LANGUAGE ---
    const groupedSongs = useMemo(() => {
        const groups: Record<string, Song[]> = {};
        
        filteredFlatList.forEach(song => {
            const lang = song.language || 'Other';
            if (!groups[lang]) groups[lang] = [];
            groups[lang].push(song);
        });
        
        return groups;
    }, [filteredFlatList]);

    const sortedLanguages = useMemo(() => Object.keys(groupedSongs).sort(), [groupedSongs]);

    return (
        // Added -mx-4 to pull container to edges on mobile, counteracting parent padding
        <div className="-mx-4 md:mx-auto bg-transparent md:bg-slate-900/60 md:backdrop-blur-xl border-0 md:border border-slate-700/50 rounded-none md:rounded-3xl shadow-none md:shadow-2xl flex flex-col max-w-7xl relative overflow-hidden min-h-[85vh]">
            
            {/* Ambient Background - Adjusted for mobile visibility */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 px-4 pt-4 md:p-8 gap-4">
                <div className="flex items-center w-full md:w-auto">
                    <div className="p-2.5 md:p-3 bg-slate-800 rounded-xl md:rounded-2xl border border-slate-700 text-amber-400 shadow-lg">
                        <MusicIcon className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div className="ml-3 md:ml-4 flex-grow">
                        <h1 className="text-xl md:text-3xl font-serif font-bold text-white tracking-tight leading-none md:leading-normal">Worship Songs</h1>
                        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">
                            Sing to the Lord a New Song
                        </p>
                    </div>
                    <button onClick={() => setCurrentPage('home')} className="md:hidden px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors">
                        <HomeIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <button onClick={() => setCurrentPage('home')} className="hidden md:block px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors">
                    <HomeIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Controls: Search + Index - Sticky on Mobile */}
            <div className="sticky top-[60px] md:top-0 z-30 bg-slate-950/90 md:bg-transparent backdrop-blur-xl border-b border-slate-800 md:border-none md:backdrop-blur-none px-4 pb-2 md:px-8 md:pb-4 transition-all">
                
                {/* Search Bar */}
                <div className="relative group mb-3 md:mb-4">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/50 to-indigo-500/50 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg h-12 md:h-14">
                        <div className="pl-4 text-slate-400">
                            <SearchIcon className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Title, Artist, or Lyrics..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full px-3 py-2 bg-transparent text-white text-sm md:text-lg focus:outline-none placeholder:text-slate-500 font-medium"
                            autoComplete="off"
                            autoCorrect="off"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => handleSearchChange('')}
                                className="pr-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex items-center justify-between pb-2">
                    <button 
                        onClick={() => setShowLikedOnly(!showLikedOnly)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border
                            ${showLikedOnly 
                                ? 'bg-pink-600/20 text-pink-400 border-pink-500/50 shadow-[0_0_10px_rgba(219,39,119,0.2)]' 
                                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                            }
                        `}
                    >
                        <HeartIcon className="h-3.5 w-3.5" filled={showLikedOnly} />
                        <span>Liked Only</span>
                    </button>
                </div>

                {/* A-Z Index Bar */}
                <div className="flex overflow-x-auto custom-scrollbar pb-3 gap-1.5 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth border-t border-slate-800/50 pt-3">
                    {alphabet.map(char => (
                        <button
                            key={char}
                            onClick={() => handleLetterClick(char)}
                            className={`
                                flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-all border
                                ${filterLetter === char 
                                    ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] scale-110' 
                                    : 'bg-slate-800/30 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                                }
                            `}
                        >
                            {char}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content List */}
            <div id="songs-container" className="flex-grow overflow-y-auto custom-scrollbar px-4 md:px-8 pb-32 pt-2 md:pt-0">
                {isLoading ? (
                    <div className="space-y-4 mt-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-slate-800/30 border border-slate-700/30 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredFlatList.length > 0 ? (
                    <div className="space-y-6 mt-2">
                        {sortedLanguages.map(lang => {
                            const songs = groupedSongs[lang];
                            const isExpanded = expandedSections.has(lang);
                            
                            return (
                                <div key={lang} className="animate-fadeIn">
                                    <div 
                                        onClick={() => toggleSection(lang)}
                                        className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 rounded-2xl cursor-pointer transition-all mb-3 group sticky top-0 z-20 shadow-md backdrop-blur-md"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-white uppercase tracking-wider">{lang}</span>
                                            <span className="px-2 py-0.5 bg-slate-700 rounded-full text-[10px] font-bold text-slate-400">{songs.length}</span>
                                        </div>
                                        <ChevronDownIcon 
                                            className={`h-5 w-5 text-slate-500 group-hover:text-amber-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                                        />
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="grid gap-3 md:gap-4 pl-2 md:pl-4 border-l-2 border-slate-800/50 ml-2 md:ml-4">
                                            {songs.map(song => {
                                                const songId = song.id || `${song.title}-${song.artist}`;
                                                return (
                                                    <SongCard 
                                                        key={songId} 
                                                        song={{...song, id: songId}}
                                                        isLiked={likedIds.has(songId)}
                                                        onToggleLike={() => handleToggleLike(song)}
                                                        onSelect={() => onSongSelect(songId)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <div className="p-4 bg-slate-800 rounded-full mb-4">
                            <MusicIcon className="h-10 w-10 text-slate-500" />
                        </div>
                        <p className="text-slate-300 text-base font-bold">No songs found</p>
                        <p className="text-slate-500 text-sm mt-1 mb-6 max-w-xs mx-auto">
                            {showLikedOnly 
                                ? "You haven't liked any songs matching these filters."
                                : "Try adjusting your search or filters."
                            }
                        </p>
                        <button 
                            onClick={() => { setSearchTerm(''); setFilterLetter('All'); setShowLikedOnly(false); }} 
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-amber-500 text-sm font-bold transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SongLibrary;
