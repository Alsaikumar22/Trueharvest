
import React from 'react';
import Logo from './Logo';
import CheckIcon from './icons/CheckIcon';
import HomeIcon from './icons/HomeIcon';
import type { Page } from '../types';

interface AboutPageProps {
    setCurrentPage: (page: Page) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
      
      {/* Cinematic Watermark */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none blur-[2px]">
          <Logo svgClassName="w-[500px] h-[500px]" showText={false} />
      </div>

      <div className="relative z-10 p-8 md:p-14">
        <button
            onClick={() => setCurrentPage('home')}
            className="absolute top-8 right-8 flex items-center space-x-2 px-4 py-2 rounded-full text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors duration-300 z-20 group"
            aria-label="Back to Home"
        >
            <HomeIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm hidden md:block">Home</span>
        </button>

        <div className="text-center mb-12">
            <div className="inline-block relative">
                <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 rounded-full"></div>
                <Logo svgClassName="w-20 h-20 relative z-10 text-amber-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400 tracking-tight mt-6">True Harvest</h1>
            <div className="flex items-center justify-center space-x-3 mt-4">
                <div className="h-px w-8 bg-slate-600"></div>
                <p className="text-xl text-slate-300 font-serif italic">A Digital Sanctuary for Faith</p>
                <div className="h-px w-8 bg-slate-600"></div>
            </div>
        </div>
        
        <div className="text-lg text-slate-300 leading-relaxed space-y-12">
            
            {/* Source of Truth - Moved to TOP for visibility */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-8 rounded-2xl border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-200"></div>
                <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center">
                    <span className="text-amber-400 mr-3">✝</span>
                    Source of Truth & Data Integrity
                </h2>
                <div className="space-y-6">
                    <p className="text-white text-lg leading-relaxed">
                        <strong>The Holy Bible is the sole and final authority for this community.</strong> We strictly adhere to the conviction that Scripture is the inspired Word of God.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <CheckIcon className="h-6 w-6 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                            <span>
                                <strong className="text-amber-100 block mb-1">Authentic Scripture Retrieval</strong>
                                All Bible verses displayed in this app are retrieved verbatim from standard, recognized translations (KJV, NKJV, ESV, etc.). We do not alter, modify, or summarize the Word of God.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <CheckIcon className="h-6 w-6 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                            <span>
                                <strong className="text-amber-100 block mb-1">Zero-Creativity AI Configuration</strong>
                                This application uses Google Gemini Artificial Intelligence strictly as a <em>database retrieval tool</em>. We have configured the AI with a "Temperature of 0" (Zero Creativity). This forces the system to fetch exact text rather than generate creative or hallucinated responses when displaying chapters.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <CheckIcon className="h-6 w-6 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                            <span>
                                <strong className="text-amber-100 block mb-1">Human Verification Encouraged</strong>
                                While we strive for 100% accuracy, technology is a tool, not a replacement for the physical Word. We encourage all users to verify verses and insights with their physical Bible.
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30">
                <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-amber-400 first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]">
                True Harvest was born from a simple yet profound vision: to create a welcoming digital space where Christians from all walks of life can gather to grow in their faith. In a world that's constantly moving, we believe it's more important than ever to have a sanctuary—a place to pause, reflect, and connect with God and with a community of believers.
                </p>
            </div>
            
            <div>
                <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center">
                    <span className="w-2 h-8 bg-slate-600 rounded-full mr-4"></span>
                    What We Offer
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { title: "Multi-Lingual Bible", desc: "Explore God's Word in English, Telugu, & Tamil." },
                        { title: "Curated Worship", desc: "A rich library of praise songs and hymns." },
                        { title: "Daily Inspiration", desc: "Verbatim Verse of the Day with practical application." },
                        { title: "Community Events", desc: "Connect with believers in your city." }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors">
                            <div className="bg-amber-500/10 p-2 rounded-lg mr-4">
                                <CheckIcon className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <strong className="block text-slate-200 mb-1">{item.title}</strong>
                                <span className="text-sm text-slate-500">{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Section using new domain */}
            <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 text-center">
                <h2 className="text-2xl font-serif font-bold text-white mb-4">Connect With Us</h2>
                <p className="text-slate-400 mb-6">
                    Have questions about the community or need prayer? Reach out to our team directly through our official channels.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="mailto:info@trueharvest.world" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition-colors">
                        info@trueharvest.world
                    </a>
                    <a href="mailto:prayer@trueharvest.world" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 rounded-xl text-slate-900 font-bold transition-colors">
                        prayer@trueharvest.world
                    </a>
                </div>
            </div>
            
            <p className="pt-8 text-center text-slate-400 italic font-serif text-xl border-t border-slate-800">
            "We are a field ripe for harvest, where seeds of faith are sown, nurtured, and grown together."
            </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;