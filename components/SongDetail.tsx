
import React, { useState, useEffect, useRef } from 'react';
import type { Song, Comment, User } from '../types';
import YoutubeIcon from './icons/YoutubeIcon';
import SpotifyIcon from './icons/SpotifyIcon';
import ShareIcon from './icons/ShareIcon';
import HeartIcon from './icons/HeartIcon';
import ChatIcon from './icons/ChatIcon';
import SongSharePopover from './SongSharePopover';
import CopyIcon from './icons/CopyIcon';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';
import TextSizeIcon from './icons/TextSizeIcon';
import HomeIcon from './icons/HomeIcon';
import { generateSongInsight } from '../services/geminiService';
import { auth, subscribeToSongComments, addCommentToSong, fetchSongById } from '../services/firebaseService';
import { SONG_DATA } from '../services/constants';

interface SongDetailProps {
  songId: string;
  currentUser: User | null;
  onBack: () => void;
}

const LIKED_SONGS_KEY = 'trueHarvestLikedSongIds';

const CommentSection: React.FC<{ songId: string; userProfile: User | null }> = ({ songId, userProfile }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToSongComments(songId, (data) => {
            setComments(data);
        });
        return () => unsubscribe();
    }, [songId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fbUser = auth.currentUser;
        
        if (!newComment.trim() || !fbUser || !userProfile) return;

        setIsSubmitting(true);
        try {
            await addCommentToSong(songId, {
                userId: fbUser.uid,
                // Use the profile display name, fallback to email prefix
                userName: userProfile.profile?.displayName || userProfile.email.split('@')[0] || 'Anonymous',
                userAvatar: userProfile.profile?.avatar || 'bg-amber-500', 
                text: newComment.trim(),
                timestamp: new Date().toISOString()
            });
            setNewComment('');
            if(scrollRef.current) scrollRef.current.scrollTop = 0;
        } catch (error) {
            console.error("Error adding comment", error);
            alert("Failed to post comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 animate-fadeIn mt-8">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">Discussion ({comments.length})</h4>

            <div ref={scrollRef} className="max-h-80 overflow-y-auto custom-scrollbar space-y-4 mb-6">
                {comments.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8 italic">Be the first to share a testimony or thought about this song.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex space-x-4">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-900 ${comment.userAvatar || 'bg-slate-700'}`}>
                                {comment.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="bg-slate-800/50 rounded-xl rounded-tl-none p-3 flex-grow border border-slate-700/50">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-xs font-bold text-amber-500">{comment.userName}</span>
                                    <span className="text-[10px] text-slate-600">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {userProfile ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..." 
                        className="flex-grow bg-slate-950 border border-slate-700 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !newComment.trim()}
                        className="bg-amber-500 text-slate-900 rounded-full px-6 py-3 text-sm font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                    >
                        Post
                    </button>
                </form>
            ) : (
                <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-sm text-slate-400">Please sign in to join the discussion.</p>
                </div>
            )}
        </div>
    );
};

const SongDetail: React.FC<SongDetailProps> = ({ songId, currentUser, onBack }) => {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showEnglishLyrics, setShowEnglishLyrics] = useState(false);
  
  // Font Size: 0=Normal, 1=Large, 2=Huge
  const [fontSizeIndex, setFontSizeIndex] = useState(0);
  const fontSizes = ['text-base md:text-xl', 'text-lg md:text-2xl', 'text-xl md:text-3xl'];
  
  const [insight, setInsight] = useState({ summary: '', theme: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  // Load Song Data
  useEffect(() => {
      const loadSong = async () => {
          setLoading(true);
          try {
              // 1. Try fetching from Firestore
              let foundSong = await fetchSongById(songId);
              
              // 2. If not found, look in static data
              if (!foundSong) {
                  // Iterate all categories and languages in static SONG_DATA
                  for (const category in SONG_DATA) {
                      for (const lang in SONG_DATA[category]) {
                          const staticSong = SONG_DATA[category][lang].find(s => {
                              const sId = s.id || `${s.title}-${s.artist}`;
                              return sId === songId;
                          });
                          if (staticSong) {
                              foundSong = { ...staticSong, id: songId };
                              break;
                          }
                      }
                      if (foundSong) break;
                  }
              }

              if (foundSong) {
                  setSong(foundSong);
                  setInsight({ summary: foundSong.summary || '', theme: foundSong.theme || '' });
              } else {
                  setError("Song not found.");
              }
          } catch (e) {
              console.error("Failed to load song", e);
              setError("An error occurred while loading the song.");
          } finally {
              setLoading(false);
          }
      };
      loadSong();
  }, [songId]);

  // Check Like Status
  useEffect(() => {
      try {
          const storedLikes = localStorage.getItem(LIKED_SONGS_KEY);
          if (storedLikes) {
              const parsed = JSON.parse(storedLikes);
              setIsLiked(Array.isArray(parsed) && parsed.includes(songId));
          }
      } catch (e) {}
  }, [songId]);

  const handleToggleLike = () => {
      setIsLiked(prev => {
          const newState = !prev;
          try {
              const storedLikes = localStorage.getItem(LIKED_SONGS_KEY);
              let likesArray = storedLikes ? JSON.parse(storedLikes) : [];
              if (!Array.isArray(likesArray)) likesArray = [];
              
              if (newState) {
                  if (!likesArray.includes(songId)) likesArray.push(songId);
              } else {
                  likesArray = likesArray.filter((id: string) => id !== songId);
              }
              localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(likesArray));
          } catch (e) {
              console.error("Failed to update likes", e);
          }
          return newState;
      });
  };

  const handleCopyLyrics = () => {
    if (!song) return;
    navigator.clipboard.writeText(currentLyrics)
      .then(() => alert('Lyrics copied to clipboard!'))
      .catch(() => alert('Failed to copy lyrics.'));
  };

  const handleDownloadLyrics = () => {
    if (!song) return;
    const fileContent = `Title: ${song.title}\nArtist: ${song.artist}\n\n---\n\n${currentLyrics}`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${song.title} - Lyrics.txt`.replace(/[/\\?%*:|"<>]/g, '-');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleShareLyrics = async () => {
    if (!song) return;
    
    const appDomain = "https://trueharvest.world";
    // Ensure ID logic matches existing deep linking
    const songId = song.id || `${song.title}-${song.artist}`.replace(/[/\\?%*:|"<>]/g, "-");
    const deepLink = `${appDomain}/?page=song&id=${encodeURIComponent(songId)}`;
    
    // Format: Title, Lyrics, Link
    const textToShare = `"${song.title}" by ${song.artist}\n\n${currentLyrics}\n\nListen on True Harvest:\n${deepLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: textToShare,
          url: deepLink,
        });
      } catch (err) {
        console.debug('Share cancelled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(textToShare)
        .then(() => alert('Lyrics and link copied to clipboard!'))
        .catch(() => alert('Failed to copy.'));
    }
  };

  const handleGenerateInsight = async () => {
      if (!song) return;
      setIsGenerating(true);
      const result = await generateSongInsight(song.title, song.artist, song.lyrics, song.language);
      if (result) {
          setInsight(result);
      }
      setIsGenerating(false);
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-slate-950">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
      );
  }

  if (error || !song) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center">
              <p className="text-red-400 mb-4">{error || "Song unavailable."}</p>
              <button onClick={onBack} className="px-6 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700">Back to Library</button>
          </div>
      );
  }

  const hasInsight = insight.summary && insight.summary.length > 0;
  const currentLyrics = (showEnglishLyrics && song.englishLyrics) ? song.englishLyrics : song.lyrics;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden animate-fadeIn pb-20">
        
        {/* Cinematic Background */}
        <div className="fixed inset-0 z-0">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-md"
                style={{ backgroundImage: `url(${song.imageUrl})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950"></div>
        </div>

        {/* Header / Nav */}
        <div className="relative z-20 px-4 py-4 md:px-8 flex justify-between items-center bg-slate-950/50 backdrop-blur-md border-b border-white/5 sticky top-0">
            <button 
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group"
            >
                <div className="p-2 bg-slate-800/50 rounded-full group-hover:bg-slate-700 border border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </div>
                <span className="font-bold uppercase tracking-widest text-xs hidden md:inline">Library</span>
            </button>
            <h1 className="text-white font-serif font-bold text-lg md:text-xl truncate max-w-[200px] md:max-w-md">{song.title}</h1>
            <button 
                onClick={() => { onBack(); }} // Go back to library
                className="p-2 text-slate-400 hover:text-white"
            >
                <HomeIcon className="h-6 w-6" />
            </button>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:p-8">
            
            {/* Song Hero */}
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="w-full md:w-64 flex-shrink-0 mx-auto md:mx-0">
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 relative group">
                        <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    
                    {/* Media Links Row */}
                    <div className="flex justify-center gap-4 mt-6">
                        <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-full transition-all border border-red-600/20" title="Watch on YouTube">
                            <YoutubeIcon className="h-6 w-6" />
                        </a>
                        {song.spotifyUrl && (
                            <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-full transition-all border border-green-500/20" title="Listen on Spotify">
                                <SpotifyIcon className="h-6 w-6" />
                            </a>
                        )}
                        <div className="relative">
                            <button onClick={() => setShowSharePopover(!showSharePopover)} className="p-3 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-full transition-all border border-slate-700">
                                <ShareIcon className="h-6 w-6" />
                            </button>
                            {showSharePopover && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30">
                                    <SongSharePopover song={song} onClose={() => setShowSharePopover(false)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-grow space-y-6 text-center md:text-left">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight leading-none mb-2">{song.title}</h2>
                        <p className="text-xl md:text-2xl text-amber-500 font-bold uppercase tracking-widest">{song.artist}</p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                        {song.album && <span className="bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">{song.album}</span>}
                        {song.year && <span className="bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">{song.year}</span>}
                        {insight.theme && <span className="bg-amber-900/20 text-amber-500 px-3 py-1 rounded-full border border-amber-900/30">{insight.theme}</span>}
                    </div>

                    {/* AI Insight Box */}
                    <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 group-hover:w-1.5 transition-all"></div>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                <SparklesIcon className="h-4 w-4" /> Divine Insight
                            </h4>
                            {hasInsight && (
                                <button 
                                    onClick={handleGenerateInsight} 
                                    disabled={isGenerating}
                                    className="text-[10px] text-slate-500 hover:text-white underline"
                                >
                                    {isGenerating ? "Refreshing..." : "Refresh"}
                                </button>
                            )}
                        </div>
                        
                        {hasInsight ? (
                            <p className="text-slate-300 text-sm leading-relaxed italic">"{insight.summary}"</p>
                        ) : (
                            <div className="text-center py-2">
                                <button 
                                    onClick={handleGenerateInsight}
                                    disabled={isGenerating}
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-bold text-xs uppercase tracking-wide transition-all border border-slate-700"
                                >
                                    {isGenerating ? "Analyzing Spirit..." : "Generate Meaning"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center md:justify-start gap-4 pt-2">
                        <button 
                            onClick={handleToggleLike}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border ${
                                isLiked 
                                ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-900/20' 
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                            }`}
                        >
                            <HeartIcon filled={isLiked} className="h-5 w-5" />
                            <span>{isLiked ? 'Saved' : 'Save to Favorites'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lyrics Section */}
            <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 sticky top-20 z-20 shadow-lg">
                    <h3 className="text-lg font-bold text-white font-serif uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Lyrics
                    </h3>
                    
                    <div className="flex items-center gap-3">
                        {/* Font Size */}
                        <button onClick={() => setFontSizeIndex((prev) => (prev + 1) % fontSizes.length)} className="p-2 rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700">
                            <TextSizeIcon className="h-4 w-4" />
                        </button>

                        {/* Dual Language */}
                        {song.englishLyrics && (
                            <div className="flex bg-slate-800 rounded p-1 border border-slate-700">
                                <button onClick={() => setShowEnglishLyrics(false)} className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${!showEnglishLyrics ? 'bg-amber-500 text-slate-900' : 'text-slate-400'}`}>Native</button>
                                <button onClick={() => setShowEnglishLyrics(true)} className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${showEnglishLyrics ? 'bg-amber-500 text-slate-900' : 'text-slate-400'}`}>English</button>
                            </div>
                        )}

                        <div className="w-px h-6 bg-slate-700 mx-1"></div>

                        <button onClick={handleShareLyrics} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700" title="Share Lyrics">
                            <ShareIcon className="h-4 w-4" />
                        </button>
                        <button onClick={handleCopyLyrics} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700" title="Copy">
                            <CopyIcon className="h-4 w-4" />
                        </button>
                        <button onClick={handleDownloadLyrics} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700" title="Download">
                            <DownloadIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-6 md:p-10 rounded-2xl border border-slate-800 shadow-inner min-h-[400px]">
                    <pre className={`text-slate-200 ${fontSizes[fontSizeIndex]} whitespace-pre-wrap font-sans leading-loose text-center tracking-wide`}>
                        {currentLyrics}
                    </pre>
                </div>
            </div>

            <CommentSection songId={songId} userProfile={currentUser} />
        </div>
    </div>
  );
};

export default SongDetail;
