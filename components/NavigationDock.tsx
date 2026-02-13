
import React, { useState } from 'react';
import type { Page, User } from '../types';
import HomeIcon from './icons/HomeIcon';
import BibleIcon from './icons/BibleIcon';
import InspirationIcon from './icons/InspirationIcon';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import CalendarIcon from './icons/CalendarIcon';
import MusicIcon from './icons/MusicIcon';
import LeafIcon from './icons/LeafIcon';
import CreateIcon from './icons/CreateIcon';
import VideoIcon from './icons/VideoIcon';
import GraphIcon from './icons/GraphIcon';
import MapIcon from './icons/MapIcon';
import ChatIcon from './icons/ChatIcon';
import Logo from './Logo';
import { triggerHaptic } from '../services/nativeService';

interface NavigationDockProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  currentUser: User | null;
}

const SanctuaryItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}> = ({ icon, label, onClick, active }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border ${
        active 
        ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className={`mb-2 ${active ? 'text-amber-400' : ''}`}>{icon}</div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const NavigationDock: React.FC<NavigationDockProps> = ({ currentPage, setCurrentPage, currentUser }) => {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  const handleNav = (page: Page) => {
    triggerHaptic('selection');
    setCurrentPage(page);
    setIsHubOpen(false);
  };

  const menuGroups = [
    {
      title: "Divine Word",
      items: [
        { page: 'plans' as Page, icon: <CalendarIcon className="h-6 w-6"/>, label: 'Plans' },
        { page: 'casestudies' as Page, icon: <BookOpenIcon className="h-6 w-6"/>, label: 'Insights' },
      ]
    },
    {
      title: "Fellowship",
      items: [
        { page: 'songs' as Page, icon: <MusicIcon className="h-6 w-6"/>, label: 'Songs' },
        // 'events' only for admin
        ...(isAdmin ? [{ page: 'events' as Page, icon: <CalendarIcon className="h-6 w-6"/>, label: 'Events' }] : []),
      ]
    },
    {
      title: "Creation",
      items: [
        { page: 'botanica' as Page, icon: <LeafIcon className="h-6 w-6"/>, label: 'Botanica' },
        { page: 'create' as Page, icon: <CreateIcon className="h-6 w-6"/>, label: 'Art' },
        // 'video' only for admin
        ...(isAdmin ? [{ page: 'video' as Page, icon: <VideoIcon className="h-6 w-6"/>, label: 'Cinema' }] : []),
      ]
    }
  ];

  return (
    <>
      {/* The Floating Dock */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-4 w-full max-w-lg">
        <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center justify-between shadow-2xl ring-1 ring-white/5">
          <button 
            onClick={() => handleNav('home')}
            className={`flex-1 flex flex-col items-center py-2 rounded-full transition-colors ${currentPage === 'home' ? 'text-amber-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <HomeIcon className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
          </button>

          <button 
            onClick={() => handleNav('verse')}
            className={`flex-1 flex flex-col items-center py-2 rounded-full transition-colors ${currentPage === 'verse' ? 'text-amber-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <InspirationIcon className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Verse</span>
          </button>

          {/* Centered "The Sanctuary" Button with TRUE HARVEST LOGO */}
          <button 
            onClick={() => {
                triggerHaptic('impact');
                setIsHubOpen(true);
            }}
            className="flex-shrink-0 w-16 h-16 -mt-8 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/30 transform transition-transform hover:scale-110 active:scale-95 border-4 border-slate-950 overflow-hidden"
          >
            <Logo showText={false} svgClassName="w-8 h-8 text-slate-950" />
          </button>

          <button 
            onClick={() => handleNav('bible')}
            className={`flex-1 flex flex-col items-center py-2 rounded-full transition-colors ${currentPage === 'bible' ? 'text-amber-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <BibleIcon className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Bible</span>
          </button>

          <button 
            onClick={() => handleNav('introspection')}
            className={`flex-1 flex flex-col items-center py-2 rounded-full transition-colors ${currentPage === 'introspection' ? 'text-amber-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <GraphIcon className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Spirit</span>
          </button>
        </div>
      </nav>

      {/* The Launchpad Overlay */}
      {isHubOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-3xl animate-fadeIn flex flex-col items-center justify-center p-6">
           <button 
             onClick={() => {
                 triggerHaptic('impact');
                 setIsHubOpen(false);
             }}
             className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all"
           >
             <XIcon className="h-8 w-8" />
           </button>

           <div className="w-full max-w-4xl">
              <div className="text-center mb-12">
                  <div className="flex justify-center mb-4">
                     <Logo showText={false} svgClassName="w-16 h-16 text-amber-400" />
                  </div>
                  <h2 className="text-5xl font-serif font-bold text-amber-400 mb-2">The Sanctuary</h2>
                  <p className="text-slate-400 tracking-widest uppercase text-xs font-bold">Discover the tools of the Harvest</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {menuGroups.map((group, idx) => (
                    <div key={idx} className="space-y-4">
                        <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] ml-1">{group.title}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {group.items.map((item, i) => (
                                <SanctuaryItem 
                                    key={i}
                                    icon={item.icon}
                                    label={item.label}
                                    active={currentPage === item.page}
                                    onClick={() => handleNav(item.page)}
                                />
                            ))}
                        </div>
                    </div>
                  ))}
              </div>

              <div className="mt-16 pt-8 border-t border-white/5 flex justify-center items-center space-x-6">
                  <button onClick={() => handleNav('about')} className="text-slate-500 hover:text-amber-400 text-xs font-bold uppercase tracking-widest transition-colors">Our Mission</button>
                  <span className="text-slate-800">•</span>
                  <button onClick={() => handleNav('profile')} className="text-slate-500 hover:text-amber-400 text-xs font-bold uppercase tracking-widest transition-colors">Profile</button>
                  
                  {isAdmin && (
                    <>
                      <span className="text-slate-800">•</span>
                      <button 
                        onClick={() => handleNav('admin')} 
                        className="text-amber-400 hover:text-amber-300 text-xs font-black uppercase tracking-widest transition-all bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                      >
                        Admin Panel
                      </button>
                    </>
                  )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default NavigationDock;
