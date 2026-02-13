
import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { EXIT_VERSES } from '../services/constants';

interface WelcomePageProps {
  onEnter: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const [verse, setVerse] = useState<{ text: string, ref: string } | null>(null);

  useEffect(() => {
      // Pick a random verse on mount to greet the user
      const random = EXIT_VERSES[Math.floor(Math.random() * EXIT_VERSES.length)];
      setVerse(random);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470790376778-a9fcd038e59e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-sm mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/40"></div>
        {/* Animated Particles/Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl text-center space-y-12 animate-fadeInUp">
        
        {/* Branding */}
        <div className="flex flex-col items-center transform transition-transform duration-700 hover:scale-105">
          <div className="relative">
             <div className="absolute inset-0 bg-amber-400 blur-[40px] opacity-20 rounded-full"></div>
             <Logo svgClassName="w-28 h-28 text-amber-400 relative z-10" showText={false} />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tracking-tight drop-shadow-2xl mt-8">
            True Harvest
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-slate-300 font-serif tracking-widest uppercase opacity-80">
            Reap the Word. Sow the Spirit.
          </p>
        </div>

        {/* Daily Welcome Verse */}
        {verse && (
            <div className="max-w-2xl mx-auto relative group cursor-default">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-amber-500/10 shadow-2xl">
                    <div className="absolute -top-4 -left-2 text-6xl text-amber-500/20 font-serif font-bold">“</div>
                    <p className="text-xl md:text-3xl font-serif text-slate-100 italic leading-relaxed mb-6 drop-shadow-md">
                        {verse.text}
                    </p>
                    <div className="absolute -bottom-8 -right-2 text-6xl text-amber-500/20 font-serif font-bold rotate-180">“</div>
                    <div className="flex items-center justify-center space-x-3">
                        <div className="h-px w-12 bg-amber-500/50"></div>
                        <p className="text-amber-400 text-sm font-bold uppercase tracking-[0.2em]">
                            {verse.ref}
                        </p>
                        <div className="h-px w-12 bg-amber-500/50"></div>
                    </div>
                </div>
            </div>
        )}

        {/* Single Entry Portal */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onEnter}
            className="group relative flex flex-col items-center px-12 py-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-full hover:bg-slate-800/60 hover:border-amber-500/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.2)] transition-all duration-500 overflow-hidden"
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex items-center space-x-4">
               <span className="text-2xl font-serif font-bold text-white group-hover:text-amber-200 transition-colors">Explore the Sanctuary</span>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            </div>
          </button>
        </div>
        
        <p className="text-slate-600 text-sm font-medium tracking-wide">© {new Date().getFullYear()} True Harvest. All rights reserved.</p>
      </div>
    </div>
  );
};

export default WelcomePage;
