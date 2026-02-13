
import React from 'react';
import type { Page } from '../types';
import ChatIcon from './icons/ChatIcon';
import CreateIcon from './icons/CreateIcon';
import MapIcon from './icons/MapIcon';
import MusicIcon from './icons/MusicIcon';
import GraphIcon from './icons/GraphIcon';
import LeafIcon from './icons/LeafIcon';
import BibleIcon from './icons/BibleIcon';
import XIcon from './icons/XIcon';
import SearchIcon from './icons/SearchIcon';

interface FeatureDiscoveryGuideProps {
    setCurrentPage: (page: Page) => void;
    onOpenChat: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const FeatureDiscoveryGuide: React.FC<FeatureDiscoveryGuideProps> = ({ setCurrentPage, onOpenChat, isOpen, onClose }) => {
    
    const features = [
        {
            title: "Ask Junia AI",
            desc: "Your biblical companion for tough questions.",
            icon: <ChatIcon className="h-6 w-6" />,
            action: () => { onOpenChat(); onClose(); },
            color: "text-amber-400",
            bg: "bg-amber-500/10"
        },
        {
            title: "Verse Art",
            desc: "Turn scripture into cinematic visuals.",
            icon: <CreateIcon className="h-6 w-6" />,
            action: () => { setCurrentPage('create'); onClose(); },
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        },
        {
            title: "Sacred Maps",
            desc: "Explore biblical history on real maps.",
            icon: <MapIcon className="h-6 w-6" />,
            action: () => { setCurrentPage('maps'); onClose(); },
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            title: "Worship Songs",
            desc: "Lyrics in English, Telugu & Tamil.",
            icon: <MusicIcon className="h-6 w-6" />,
            action: () => { setCurrentPage('songs'); onClose(); },
            color: "text-pink-400",
            bg: "bg-pink-500/10"
        },
        {
            title: "Introspection",
            desc: "Track your spiritual peace & habits.",
            icon: <GraphIcon className="h-6 w-6" />,
            action: () => { setCurrentPage('introspection'); onClose(); },
            color: "text-teal-400",
            bg: "bg-teal-500/10"
        },
        {
            title: "Botanica",
            desc: "Profiles of biblical characters.",
            icon: <LeafIcon className="h-6 w-6" />,
            action: () => { setCurrentPage('botanica'); onClose(); },
            color: "text-green-400",
            bg: "bg-green-500/10"
        },
        {
            title: "Bible Reader",
            desc: "Multi-lingual with Audio support.",
            icon: <BibleIcon className="h-6 w-6" />,
            action: () => { setCurrentPage('bible'); onClose(); },
            color: "text-slate-200",
            bg: "bg-slate-500/10"
        }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-fadeIn"
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeInUp flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-1">True Harvest Sanctuary</h2>
                        <p className="text-slate-400 text-sm">Everything you need to grow in faith.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature, idx) => (
                            <button
                                key={idx}
                                onClick={feature.action}
                                className="flex flex-col items-start p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-500/30 transition-all group text-left hover:-translate-y-1"
                            >
                                <div className={`p-3 rounded-xl mb-4 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{feature.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-950 border-t border-white/5 text-center">
                    <p className="text-slate-500 text-xs italic font-serif">
                        "Ask and it will be given to you; seek and you will find." — Matthew 7:7
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeatureDiscoveryGuide;
