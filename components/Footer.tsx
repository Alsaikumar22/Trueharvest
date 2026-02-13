
import React from 'react';
import type { Page } from '../types';
import { BIBLE_METADATA } from '../services/constants';

interface FooterProps {
    setCurrentPage: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  // Only show first 3 and last 3 to save space, but render link to full bible
  // Actually for SEO we want links. Let's create a compact list of popular books.
  const popularBooks = ['Genesis', 'Psalm', 'Proverbs', 'Matthew', 'John', 'Romans', 'Revelation'];

  return (
    <>
      {/* Standard Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-md text-slate-400 mt-12 border-t border-slate-700/50 pb-24">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div className="text-center md:text-left">
                  <p className="font-serif text-2xl text-white">True Harvest</p>
                  <p className="text-sm mt-2">&copy; {new Date().getFullYear()} Christian Community.</p>
                  <p className="text-xs mt-2 text-slate-500">Reap the Word. Sow the Spirit.</p>
              </div>
              
              {/* Quick Links */}
              <div className="flex flex-col items-center md:items-start space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Sanctuary</h4>
                  <button onClick={() => setCurrentPage('home')} className="hover:text-amber-400 transition-colors">Home</button>
                  <button onClick={() => setCurrentPage('bible')} className="hover:text-amber-400 transition-colors">Bible Reader</button>
                  <button onClick={() => setCurrentPage('songs')} className="hover:text-amber-400 transition-colors">Worship Songs</button>
              </div>

              {/* Bible Directory (SEO Crawl Path) */}
              <div className="flex flex-col items-center md:items-start">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Popular Scripture</h4>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs">
                      {popularBooks.map(book => (
                          <a 
                            key={book}
                            href={`/?page=bible&book=${book}&chapter=1`}
                            onClick={(e) => {
                                e.preventDefault();
                                // Manually trigger navigation for SPA feel, but keep href for crawlers
                                const params = new URLSearchParams();
                                params.set('page', 'bible');
                                params.set('book', book);
                                params.set('chapter', '1');
                                try {
                                    window.history.pushState(null, '', `/?${params.toString()}`);
                                } catch (e) {}
                                setCurrentPage('bible');
                            }}
                            className="bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 px-2 py-1 rounded transition-colors"
                          >
                              {book}
                          </a>
                      ))}
                      <button onClick={() => setCurrentPage('bible')} className="text-slate-500 hover:text-white underline decoration-dotted">View All 66 Books</button>
                  </div>
              </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
              <div className="flex space-x-6 mb-4 md:mb-0">
                  <button onClick={() => setCurrentPage('about')} className="hover:text-slate-400">About Us</button>
                  <a href="mailto:support@trueharvest.world" className="hover:text-slate-400">Contact Support</a>
                  <span className="text-amber-500/50">v2.0.0 (Next Gen)</span>
              </div>
              <div className="flex items-center space-x-2">
                  <span>Powered by</span>
                  <span className="font-bold text-slate-500">Google Gemini & Firebase</span>
              </div>
          </div>
        </div>
      </footer>

      {/* Sticky Content Source Badge - Always visible at bottom */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none w-full flex justify-center px-4">
          <div className="pointer-events-auto inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-slate-950/90 backdrop-blur-xl border border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:border-amber-500/40 hover:scale-105 hover:bg-slate-900">
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                  Content Source: Cloud Database
              </span>
              <div className="h-4 w-px bg-slate-700 mx-2 hidden sm:block shrink-0"></div>
              <div className="flex items-center space-x-1.5 opacity-90 hover:opacity-100 transition-all duration-300 shrink-0">
                  {/* Firebase Logo SVG */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.89 15.672L6.255.461A.54.54 0 017.27.288l2.543 4.771zm16.786.59L17.377 1.78a.54.54 0 00-.952-.063l-2.466 4.96L3.89 15.672l8.033 4.51a.54.54 0 00.526 0l8.227-4.599z" fill="#FFCA28"/>
                      <path d="M13.96 6.677l-2.467-4.96a.54.54 0 00-.952.063L3.89 15.672l10.07 5.655z" fill="#FFA000"/>
                      <path d="M10.06 6.67l2.542-4.77a.54.54 0 00-1.015-.174L3.89 15.67l6.17 3.464z" fill="#F57F17"/>
                  </svg>
                  <span className="text-[10px] sm:text-xs font-bold text-amber-500">Firebase</span>
              </div>
          </div>
      </div>
    </>
  );
};

export default Footer;
