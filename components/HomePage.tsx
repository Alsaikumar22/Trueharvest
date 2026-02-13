
import React, { useRef, useState } from 'react';
import type { Page, User } from '../types';
import BibleIcon from './icons/BibleIcon';
import MusicIcon from './icons/MusicIcon';
import CalendarIcon from './icons/CalendarIcon';
import InspirationIcon from './icons/InspirationIcon';
import CreateIcon from './icons/CreateIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import SearchIcon from './icons/SearchIcon';
import LeafIcon from './icons/LeafIcon';
import VideoIcon from './icons/VideoIcon';
import GraphIcon from './icons/GraphIcon';
import MapIcon from './icons/MapIcon';
import ChatIcon from './icons/ChatIcon';
import Logo from './Logo';
import { BIBLE_METADATA } from '../services/constants';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';
import CheckIcon from './icons/CheckIcon';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  currentUser: User | null;
  openChat: () => void;
}

const NavCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactElement<{ className?: string }>; 
  onClick: () => void;
  imageUrl: string;
  isLocked?: boolean;
  lockMessage?: string;
}> = ({ title, description, icon, onClick, imageUrl, isLocked = false, lockMessage = "Membership required." }) => (
  <button
    onClick={onClick}
    disabled={isLocked}
    className={`relative group w-full h-72 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-700 text-left border 
        ${isLocked ? 'cursor-not-allowed opacity-60 border-slate-300 dark:border-slate-800/50' : 'border-slate-200 dark:border-slate-800/50 hover:border-amber-500/40 hover:shadow-amber-500/10 transform hover:-translate-y-3'}
    `}
  >
    <div
      className={`absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-in-out ${isLocked ? 'grayscale' : 'group-hover:scale-110 opacity-60 group-hover:opacity-40'}`}
      style={{ backgroundImage: `url(${imageUrl})` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/40 to-transparent dark:from-slate-950 dark:via-slate-950/40 dark:to-transparent"></div>
    
    <div className="relative h-full flex flex-col justify-end p-8 z-10">
      <div className={`absolute top-8 right-8 p-4 rounded-2xl backdrop-blur-xl border transition-all duration-500 ${
          isLocked 
            ? 'bg-slate-200/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-600' 
            : 'bg-white/80 dark:bg-amber-500/10 border-slate-200 dark:border-amber-500/20 text-amber-500 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-slate-950 shadow-md dark:shadow-none'
      }`}>
        {isLocked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ) : (
            React.cloneElement(icon, { className: "h-6 w-6" })
        )}
      </div>
      
      <h3 className={`text-3xl font-bold font-serif tracking-tight mb-2 transition-colors ${isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-200'}`}>{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          {isLocked ? lockMessage : description}
      </p>
    </div>
  </button>
);

const SectionHeader: React.FC<{ title: string; subtitle: string; icon: React.ReactNode }> = ({ title, subtitle, icon }) => (
    <div className="flex flex-col items-center mb-16 text-center">
        <div className="p-4 bg-white dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-slate-800 text-amber-500 mb-6 shadow-xl dark:shadow-inner">
            {icon}
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-white mb-4 tracking-tight italic">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg font-medium tracking-widest uppercase text-xs">{subtitle}</p>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent rounded-full mt-6 opacity-40"></div>
    </div>
);

const FeatureItem: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-800/30 transition-colors">
        <div className="mt-1 p-1 bg-amber-500/10 rounded-full">
            <CheckIcon className="h-4 w-4 text-amber-500" />
        </div>
        <div>
            <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
            <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
        </div>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, currentUser, openChat }) => {
  const isRegistered = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const contentRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToContent = () => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      try {
          // 1. Parse Query
          const searchRegex = /^((?:1|2|3|I|II|III)?\s?[a-zA-Z\s]+?)\s*(\d+)(?:[:.\s](\d+))?$/i;
          const match = searchQuery.trim().match(searchRegex);

          if (!match) {
              alert("Invalid format. Please try 'John 3:16' or 'Genesis 1'");
              return;
          }

          let searchBook = match[1] ? match[1].trim() : '';
          const searchChapter = match[2] ? parseInt(match[2]) : 1;
          const searchVerse = match[3] ? parseInt(match[3]) : null;

          if (!searchBook) {
              alert("Could not identify the book name.");
              return;
          }

          // 2. Normalize Book Name
          const abbrMap: Record<string, string> = {
              'gen': 'Genesis', 'ex': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers', 'deut': 'Deuteronomy',
              'josh': 'Joshua', 'judg': 'Judges', 'ruth': 'Ruth', 'sam': 'Samuel', 'kgs': 'Kings', 'chr': 'Chronicles',
              'neh': 'Nehemiah', 'est': 'Esther', 'job': 'Job', 'ps': 'Psalm', 'prov': 'Proverbs', 'ecc': 'Ecclesiastes',
              'song': 'Song of Solomon', 'isa': 'Isaiah', 'jer': 'Jeremiah', 'lam': 'Lamentations', 'eze': 'Ezekiel', 
              'dan': 'Daniel', 'hos': 'Hosea', 'joel': 'Joel', 'amos': 'Amos', 'obad': 'Obadiah', 'jon': 'Jonah', 
              'mic': 'Micah', 'nah': 'Nahum', 'hab': 'Habakkuk', 'zeph': 'Zephaniah', 'hag': 'Haggai', 'zech': 'Zechariah', 
              'mal': 'Malachi', 'matt': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John', 'acts': 'Acts', 
              'rom': 'Romans', 'cor': 'Corinthians', 'gal': 'Galatians', 'eph': 'Ephesians', 'phil': 'Philippians', 
              'col': 'Colossians', 'thess': 'Thessalonians', 'tim': 'Timothy', 'titus': 'Titus', 'phlm': 'Philemon', 
              'heb': 'Hebrews', 'jas': 'James', 'pet': 'Peter', 'jude': 'Jude', 'rev': 'Revelation'
          };

          let foundBook = BIBLE_METADATA.find(b => b.en.toLowerCase() === searchBook.toLowerCase());
          
          if (!foundBook) {
              const lowerSearch = searchBook.toLowerCase();
              for (const key in abbrMap) {
                  if (lowerSearch.includes(key)) {
                      const prefixMatch = lowerSearch.match(/^(\d)\s/);
                      const prefix = prefixMatch ? prefixMatch[1] + ' ' : '';
                      const potentialName = prefix + abbrMap[key];
                      const candidate = BIBLE_METADATA.find(b => b.en.toLowerCase() === potentialName.toLowerCase());
                      if (candidate) {
                          foundBook = candidate;
                          break;
                      }
                  }
              }
          }

          if (foundBook) {
              const params = new URLSearchParams();
              params.set('page', 'bible');
              params.set('book', foundBook.en);
              const safeChapter = Math.min(Math.max(1, searchChapter), foundBook.chapters || 1);
              params.set('chapter', safeChapter.toString());
              if (searchVerse) {
                  params.set('verses', searchVerse.toString());
              }
              const newUrl = `/?${params.toString()}`;
              
              // Safe history update
              try {
                  if (window.location.protocol !== 'blob:' && window.location.protocol !== 'data:') {
                      window.history.pushState(null, '', newUrl);
                  }
              } catch (e) {
                  // Silently ignore history errors in restricted environments
              }

              try {
                  sessionStorage.setItem('trueHarvestBibleNav', JSON.stringify({
                      book: foundBook.en,
                      chapter: safeChapter,
                      verse: searchVerse
                  }));
              } catch (e) {
                  console.error("Session storage failed", e);
              }
              setCurrentPage('bible');
          } else {
              alert("Book not found. Please check spelling.");
          }
      } catch (err) {
          console.error("Search Error:", err);
          alert("An unexpected error occurred during search. Please try again.");
      }
  };

  return (
    <div className="-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 font-sans text-slate-900 dark:text-gray-200 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2574&auto=format&fit=crop" 
                alt="Cinematic Background" 
                className="w-full h-full object-cover scale-110 animate-[kenburns_30s_infinite_alternate]" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/20 to-slate-50 dark:from-slate-950/80 dark:via-slate-950/20 dark:to-slate-950 transition-colors duration-500"></div>
            <div className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        {/* Note: Floating Flight button removed from here to be placed globally in FloatingActionStack */}

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center animate-fadeInUp">
            <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                <Logo svgClassName="w-24 h-24 text-amber-500 dark:text-amber-400 relative z-10 transform group-hover:scale-110 transition-transform duration-700" showText={false} />
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-serif font-bold text-slate-900 dark:text-white tracking-tighter mb-4 leading-none select-none drop-shadow-sm">
                True <span className="text-amber-500 dark:text-amber-400">Harvest</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-serif italic mb-8 tracking-wide opacity-90">
                A Cinematic Digital Sanctuary for the Faithful.
            </p>

            {/* Main Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mb-12 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full shadow-2xl p-2">
                    <div className="pl-4 text-slate-400"><BookOpenIcon className="h-6 w-6" /></div>
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Scripture (e.g. John 3:16)..." 
                        className="flex-grow bg-transparent border-none outline-none px-4 py-3 text-lg text-slate-900 dark:text-white placeholder-slate-500 font-serif"
                    />
                    <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-900 p-3 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg">
                        <SearchIcon className="h-6 w-6" />
                    </button>
                </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={scrollToContent}
                    className="px-10 py-4 bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white font-bold text-lg rounded-full border border-slate-200 dark:border-white/10 transition-all shadow-sm"
                >
                    Explore Sanctuary
                </button>
                {!isRegistered && (
                    <button 
                        onClick={() => setCurrentPage('about')}
                        className="px-10 py-4 text-slate-500 dark:text-slate-400 hover:text-amber-500 font-bold text-lg transition-colors"
                    >
                        Our Mission
                    </button>
                )}
            </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40 cursor-pointer" onClick={scrollToContent}>
            <svg className="w-8 h-8 text-slate-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* Navigation Hub */}
      <section ref={contentRef} className="relative z-10 bg-slate-50 dark:bg-slate-950 py-32 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
        <div className="max-w-7xl mx-auto space-y-32">
            
            {/* The Daily Bread */}
            <div>
                <SectionHeader 
                    title="Daily Bread" 
                    subtitle="Start your day anchored in truth" 
                    icon={<InspirationIcon className="h-10 w-10" />} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <NavCard 
                        title="Verse of the Day"
                        description="Direct scripture with deep theological insights."
                        icon={<InspirationIcon />}
                        onClick={() => setCurrentPage('verse')}
                        imageUrl="https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1920&auto=format&fit=crop"
                    />
                    <NavCard 
                        title="Introspection"
                        description="Track your spiritual peace and consistency."
                        icon={<GraphIcon />}
                        onClick={() => setCurrentPage('introspection')}
                        // Updated to a Yoga/Meditation related image
                        imageUrl="https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2670&auto=format&fit=crop"
                        isLocked={!isRegistered}
                        lockMessage="Membership required to track progress."
                    />
                </div>
            </div>

            {/* The Knowledge Library */}
            <div>
                <SectionHeader 
                    title="The Knowledge Library" 
                    subtitle="Deep study tools for the growing disciple" 
                    icon={<BookOpenIcon className="h-10 w-10" />} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <NavCard 
                        title="Bible Reader"
                        description="Multi-lingual support with parallel comparison."
                        icon={<BibleIcon />}
                        onClick={() => setCurrentPage('bible')}
                        imageUrl="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1920&auto=format&fit=crop"
                    />
                    <NavCard 
                        title="Bible Chat"
                        description="AI Pastoral guide answering from Scripture."
                        icon={<ChatIcon />}
                        onClick={openChat} 
                        imageUrl="https://images.unsplash.com/photo-1520114878144-6123749968dd?q=80&w=2000&auto=format&fit=crop"
                        isLocked={!isRegistered}
                        lockMessage="Membership required to chat."
                    />
                    <NavCard 
                        title="Sacred Maps"
                        description="Explore biblical history with Google Maps."
                        icon={<MapIcon />}
                        onClick={() => setCurrentPage('maps')}
                        imageUrl="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop"
                        isLocked={!isRegistered}
                        lockMessage="Membership required for maps."
                    />
                </div>
                {/* Secondary row for overflow or specialized items */}
                <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 mt-8">
                     <NavCard 
                        title="Reading Plans"
                        description="Structured journeys through God's Word."
                        icon={<CalendarIcon />}
                        onClick={() => setCurrentPage('plans')}
                        imageUrl="https://images.unsplash.com/photo-1519681393798-38e43269d877?q=80&w=2000&auto=format&fit=crop"
                        isLocked={!isRegistered}
                        lockMessage="Membership required for plans."
                    />
                     <NavCard 
                        title="Offline Library"
                        description="Download versions for reading without internet."
                        icon={<DownloadIcon />}
                        onClick={() => setCurrentPage('bible')} 
                        imageUrl="https://images.unsplash.com/photo-1526554850534-7c78330d5f90?q=80&w=1920&auto=format&fit=crop"
                    />
                </div>
            </div>

            {/* The Creative Garden */}
            <div>
                <SectionHeader 
                    title="The Creative Garden" 
                    subtitle="Experience scripture through AI art & cinema" 
                    icon={<LeafIcon className="h-10 w-10" />} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <NavCard 
                        title="Botanica"
                        description="Discover the legacy of biblical heroes."
                        icon={<LeafIcon />}
                        onClick={() => setCurrentPage('botanica')}
                        imageUrl="https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=2000&auto=format&fit=crop"
                        isLocked={!isRegistered}
                        lockMessage="Membership required for Botanica."
                    />
                    <NavCard 
                        title="Scripture Art"
                        description="Turn any verse into high-quality visual art."
                        icon={<CreateIcon />}
                        onClick={() => setCurrentPage('create')}
                        imageUrl="https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=2680&auto=format&fit=crop"
                        isLocked={!isRegistered}
                        lockMessage="Membership required to create."
                    />
                    <NavCard 
                        title="Video Generation"
                        description="Animate spiritual moments with cinematic AI."
                        icon={<VideoIcon />}
                        onClick={() => setCurrentPage('video')}
                        imageUrl="https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2000&auto=format&fit=crop"
                        isLocked={!isAdmin}
                        lockMessage="Currently restricted to Admin."
                    />
                </div>
            </div>
            
            {/* The Community Hall */}
            <div>
                <SectionHeader 
                    title="The Community Hall" 
                    subtitle="Music, fellowship, and worship" 
                    icon={<MusicIcon className="h-10 w-10" />} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <NavCard 
                        title="Worship Library"
                        description="Curated hymns and contemporary praise."
                        icon={<MusicIcon />}
                        onClick={() => setCurrentPage('songs')}
                        imageUrl="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop"
                        isLocked={!isRegistered}
                        lockMessage="Membership required for songs."
                    />
                    <NavCard 
                        title="Fellowship Events"
                        description="Join local and digital gatherings."
                        icon={<CalendarIcon />}
                        onClick={() => setCurrentPage('events')}
                        imageUrl="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2000&auto=format&fit=crop"
                        isLocked={!isAdmin}
                        lockMessage="Currently restricted to Admin."
                    />
                </div>
            </div>

            {/* Feature Overview / Know More */}
            <article id="discover-section" ref={discoverRef} className="max-w-5xl mx-auto mt-32 bg-slate-900/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
                
                <h3 className="text-3xl font-serif font-bold text-white mb-8 flex items-center">
                    <SparklesIcon className="h-8 w-8 text-amber-500 mr-3" />
                    Discover True Harvest
                </h3>
                
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                    <FeatureItem 
                        title="Introspection Journal" 
                        desc="Track your spiritual peace, daily habits (prayer, worship), and analyze your sentiments with AI to receive a custom 'Prescription Verse' and prayer strategy." 
                    />
                    <FeatureItem 
                        title="Ask Junia (AI Assistant)" 
                        desc="Chat with our biblical AI companion trained to answer theological questions strictly from Scripture, offering comfort and wisdom." 
                    />
                    <FeatureItem 
                        title="Offline & Indexed DB" 
                        desc="Download full Bible versions (KJV, BSI for Indian Languages) to your device for fast, offline reading anywhere." 
                    />
                    <FeatureItem 
                        title="Worship Songs" 
                        desc="A vast library of lyrics in English, Telugu, and Tamil. Includes transliterations and direct links to YouTube/Spotify." 
                    />
                    <FeatureItem 
                        title="AI Insight & Summary" 
                        desc="Get instant 1-sentence summaries, key theological themes, and cross-references for any verse selected in the Bible Reader." 
                    />
                    <FeatureItem 
                        title="Smart Cross-References" 
                        desc="Hover or tap on references within the text (e.g., 'John 3:16') to instantly preview the verse without leaving your chapter." 
                    />
                    <FeatureItem 
                        title="Botanica Characters" 
                        desc="Explore detailed profiles of biblical figures (Kings, Prophets, Disciples) with their origins, fruits, and thorns." 
                    />
                    <FeatureItem 
                        title="Parallel Reading" 
                        desc="Compare translations side-by-side (e.g., English KJV vs Telugu BSI) to deepen your understanding of the Word." 
                    />
                </div>
            </article>

            {/* SEO Content Block */}
            <article className="max-w-4xl mx-auto mt-16 text-center md:text-left opacity-60 hover:opacity-100 transition-opacity">
                <div className="space-y-6 text-slate-500 leading-relaxed text-xs">
                    <p>
                        <strong>True Harvest</strong> is a premier <strong>Online Bible</strong> and digital sanctuary designed for the modern Christian believer. We provide free access to the <strong>Holy Scriptures</strong> in multiple languages, including English (KJV, NKJV, ESV, NIV), Telugu, Tamil, Hindi, and Malayalam.
                    </p>
                    <p>
                        Whether you are looking for a <strong>Bible app</strong> for daily devotion, preparing a sermon, or simply seeking peace, True Harvest is your dedicated space to "Reap the Word and Sow the Spirit." Join our global community of believers today.
                    </p>
                </div>
            </article>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
