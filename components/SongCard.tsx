
import React from 'react';
import type { Song } from '../types';
import YoutubeIcon from './icons/YoutubeIcon';
import SpotifyIcon from './icons/SpotifyIcon';
import HeartIcon from './icons/HeartIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface SongCardProps {
  song: Song;
  isLiked: boolean;
  onToggleLike: () => void;
  onSelect: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, isLiked, onToggleLike, onSelect }) => {
  return (
    <div 
        className="relative group border rounded-xl md:rounded-2xl transition-all duration-300 overflow-hidden bg-slate-900/40 border-slate-700/50 hover:border-slate-600 hover:shadow-lg cursor-pointer"
        onClick={onSelect}
    >
        {/* Background Image with optimized opacity for text readability */}
        <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-105 opacity-10 group-hover:opacity-15"
            style={{ backgroundImage: `url(${song.imageUrl})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent transition-opacity duration-300" />
      
      {/* Content Wrapper */}
      <div className="relative z-10">
        <div className="p-3 md:p-5">
          <div className="flex items-start justify-between">
              <div className="flex-grow pr-3">
                <h3 className="text-lg md:text-2xl font-bold font-serif text-slate-100 group-hover:text-amber-100 transition-colors tracking-tight leading-snug line-clamp-2">
                    {song.title}
                </h3>
                <div className="flex items-center flex-wrap gap-2 mt-1.5">
                    <p className="text-[10px] md:text-sm font-bold text-amber-500/90 uppercase tracking-widest truncate max-w-[200px]">
                        {song.artist}
                    </p>
                    {song.englishLyrics && (
                        <span className="text-[8px] font-bold bg-slate-800 border border-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Dual</span>
                    )}
                </div>
              </div>
              
              {/* Media Links (Top Right) - Compact on Mobile */}
              <div className="flex items-center gap-1">
                  <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800/80 rounded-full transition-all" title="Watch on YouTube">
                      <YoutubeIcon className="h-5 w-5" />
                  </a>
                  {song.spotifyUrl && <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-slate-400 hover:text-green-500 hover:bg-slate-800/80 rounded-full transition-all" title="Listen on Spotify">
                      <SpotifyIcon className="h-5 w-5" />
                  </a>}
                  
                  {/* Like Indicator */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
                    className={`p-2 transition-all rounded-full hover:bg-slate-800/80 ${isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
                    title={isLiked ? "Unlike" : "Like"}
                  >
                      <HeartIcon filled={isLiked} className="h-5 w-5" />
                  </button>

                  {/* View Indicator */}
                  <div className="p-2 text-slate-500">
                      <ChevronDownIcon className="h-5 w-5 -rotate-90" />
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;
