
import React, { useState, useEffect } from 'react';
import type { Page } from '../types';
import FloatingChatWidget from './FloatingChatWidget';
import FeatureDiscoveryGuide from './FeatureDiscoveryGuide';
import FlightIcon from './icons/FlightIcon';
import CompassIcon from './icons/CompassIcon';
import XIcon from './icons/XIcon';

interface FloatingActionStackProps {
    setCurrentPage: (page: Page) => void;
    currentPage: Page;
}

const FloatingActionStack: React.FC<FloatingActionStackProps> = ({ setCurrentPage, currentPage }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    
    // Junia Animation State
    const [showJuniaGreeting, setShowJuniaGreeting] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    
    // Listen for header event
    useEffect(() => {
        const handleOpen = () => setIsChatOpen(true);
        window.addEventListener('open-junia-chat', handleOpen);
        return () => window.removeEventListener('open-junia-chat', handleOpen);
    }, []);

    useEffect(() => {
        if (isDismissed) return;

        // Show greeting every 8 seconds, stay visible for 5 seconds
        const cycleDuration = 8000; 
        const visibleDuration = 5000; 

        const interval = setInterval(() => {
            if (!isChatOpen && !isDismissed) {
                setShowJuniaGreeting(true);
                setTimeout(() => {
                    // Only hide if it hasn't been manually dismissed in the meantime
                    setShowJuniaGreeting(prev => prev ? false : false); 
                }, visibleDuration);
            }
        }, cycleDuration);

        // Initial delay to start the cycle
        const initialTimer = setTimeout(() => {
             if (!isChatOpen && !isDismissed) {
                setShowJuniaGreeting(true);
                setTimeout(() => setShowJuniaGreeting(prev => prev ? false : false), visibleDuration);
            }
        }, 1500);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimer);
        };
    }, [isChatOpen, isDismissed]);

    const handleFlightClick = () => {
        if (currentPage !== 'home') {
            setCurrentPage('home');
            setTimeout(() => {
                const el = document.getElementById('discover-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } else {
            const el = document.getElementById('discover-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDismissGreeting = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDismissed(true);
        setShowJuniaGreeting(false);
    };
    
    return (
        <>
            {/* The Floating Stack - Bottom Right */}
            <div className="fixed bottom-24 right-4 z-[90] flex flex-col items-end gap-3 pointer-events-none">
                
                {/* 1. FLIGHT BUTTON (Top of Stack) */}
                <button 
                    onClick={handleFlightClick}
                    className="pointer-events-auto group relative w-12 h-12 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-full shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/50 hover:scale-110 transition-all duration-300"
                    title="Discover True Harvest"
                >
                    <div className="text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                        <FlightIcon className="h-5 w-5" />
                    </div>
                    {/* Tooltip to Left */}
                    <div className="absolute right-full mr-3 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-white/10 pointer-events-none">
                        Discover
                    </div>
                </button>

                {/* 2. DOUBTS BUTTON (Middle of Stack) */}
                <button 
                    onClick={() => setIsGuideOpen(true)}
                    className="pointer-events-auto group relative w-12 h-12 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-full shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/50 hover:scale-110 transition-all duration-300"
                    title="Still Doubts?"
                >
                    <div className="text-amber-500 group-hover:animate-[spin_4s_linear_infinite]">
                        <CompassIcon className="h-5 w-5" />
                    </div>
                    {/* Tooltip to Left */}
                    <div className="absolute right-full mr-3 bg-slate-900 text-amber-500 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-amber-500/20 pointer-events-none">
                        Still Doubts?
                    </div>
                </button>

                {/* 3. JUNIA BUTTON (Bottom of Stack) */}
                <div className="relative pointer-events-auto flex items-end">
                    
                    {/* Greeting Bubble */}
                    <div 
                        className={`absolute bottom-full right-0 mb-4 w-60 bg-white text-slate-900 p-4 rounded-2xl rounded-br-none shadow-2xl z-20 border border-amber-500/20 transition-all duration-500 origin-bottom-right ${showJuniaGreeting && !isChatOpen && !isDismissed ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}
                    >
                        {/* Dismiss Button */}
                        <button 
                            onClick={handleDismissGreeting}
                            className="absolute -top-2 -right-2 bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-full p-1 shadow-md transition-colors"
                            title="Don't show again this session"
                        >
                            <XIcon className="h-3 w-3" />
                        </button>

                        <div className="flex items-start gap-3">
                            <span className="text-2xl animate-bounce mt-1">👋</span>
                            <p className="text-xs font-bold leading-relaxed text-left text-slate-800">
                                Hello Beloved in Christ, I am Junia, I am here to help you, please let me know!
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 relative ${
                            isChatOpen 
                            ? 'bg-slate-700 border-slate-600 rotate-90 text-white' 
                            : 'bg-amber-100 border-amber-500'
                        }`}
                    >
                        {isChatOpen ? (
                            <XIcon className="h-6 w-6" />
                        ) : (
                            <div className="relative w-full h-full rounded-full flex items-center justify-center bg-amber-50 text-4xl">
                                {/* Princess/Queen Emoji */}
                                <div className="transform translate-y-0.5">👸</div>
                                
                                {/* Waving Hand Animation Overlay */}
                                <div className="absolute bottom-0 right-0 z-20 animate-[wave_2s_infinite] origin-bottom-right text-base drop-shadow-sm">
                                    👋
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Render Windows */}
            <FloatingChatWidget isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
            
            <FeatureDiscoveryGuide 
                isOpen={isGuideOpen} 
                onClose={() => setIsGuideOpen(false)}
                setCurrentPage={setCurrentPage} 
                onOpenChat={() => { setIsGuideOpen(false); setIsChatOpen(true); }} 
            />
            
            {/* Styles for wave animation */}
            <style>{`
                @keyframes wave {
                    0% { transform: rotate(0deg); }
                    20% { transform: rotate(14deg); }
                    40% { transform: rotate(-8deg); }
                    60% { transform: rotate(14deg); }
                    80% { transform: rotate(-4deg); }
                    100% { transform: rotate(10deg); }
                }
            `}</style>
        </>
    );
};

export default FloatingActionStack;
