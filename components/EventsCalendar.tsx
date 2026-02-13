
import React, { useState, useMemo, useEffect } from 'react';
import { EVENTS } from '../services/constants';
import { updateMetadata } from '../services/seoService';
import type { Event, Page } from '../types';
import CalendarIcon from './icons/CalendarIcon';
import ShareIcon from './icons/ShareIcon';
import HomeIcon from './icons/HomeIcon';

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareText = `Join me for "${event.title}" on ${formattedDate} at ${formattedTime}. Find out more on the True Harvest App!`;
     if (navigator.share) {
        navigator.share({
            title: `Event: ${event.title}`,
            text: shareText,
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Event info copied to clipboard!');
        });
    }
  };

  return (
    <div className="group relative flex flex-col md:flex-row items-stretch bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-amber-900/10">
      
      {/* Date Badge (Ticket Stub Look) */}
      <div className="md:w-32 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-dashed border-slate-600 relative">
        <div className="text-amber-500 font-bold uppercase text-sm tracking-widest mb-1">{eventDate.toLocaleString('default', { month: 'short' })}</div>
        <div className="text-4xl font-serif font-bold text-white mb-1">{eventDate.getDate()}</div>
        <div className="text-slate-400 text-xs font-semibold">{eventDate.getFullYear()}</div>
        
        {/* Decorative Circles for Ticket effect */}
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-950 rounded-full hidden md:block"></div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-slate-950 rounded-full hidden md:block"></div>
      </div>

      {/* Content */}
      <div className="flex-grow p-6 flex flex-col justify-center relative">
         <div className="absolute top-0 right-0 p-4">
             <button
                onClick={handleShare}
                className="p-2 rounded-full text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                aria-label="Share event"
            >
                <ShareIcon className="h-5 w-5" />
            </button>
         </div>

        <h3 className="text-2xl font-bold font-serif text-white mb-2 group-hover:text-amber-200 transition-colors">{event.title}</h3>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-4">
             <span className="flex items-center space-x-1 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                <span className="text-amber-500">⏰</span>
                <span>{formattedTime}</span>
             </span>
             <span className="flex items-center space-x-1 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                <span className="text-amber-500">📍</span>
                <span className="font-semibold">{event.city}</span>
             </span>
        </div>
        
        <p className="text-slate-400 leading-relaxed text-sm border-t border-slate-800 pt-4 mt-auto">
            {event.description}
        </p>
      </div>
    </div>
  );
};

interface EventsCalendarProps {
    setCurrentPage: (page: Page) => void;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ setCurrentPage }) => {
    const [selectedCity, setSelectedCity] = useState('All');

    useEffect(() => {
        updateMetadata(
            "Christian Events & Gatherings",
            "Find Christian events, worship nights, and bible study gatherings near you with True Harvest.",
            "/?page=events"
        );
    }, []);

    const indianMetroCities = ['All', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad', 'Kolkata'];
    const otherCities = useMemo(() => 
        ['All', ...new Set(EVENTS.map(e => e.city).filter(c => !indianMetroCities.includes(c)))].sort(), 
    []);

    const cities = useMemo(() => {
        const metro = indianMetroCities.filter(c => c === 'All' || EVENTS.some(e => e.city === c));
        const others = otherCities.filter(c => c !== 'All' && EVENTS.some(e => e.city === c));
        return [...metro, ...others];
    }, [otherCities]);
    
    const sortedEvents = useMemo(() => EVENTS.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), []);

    const filteredEvents = useMemo(() => {
        if (selectedCity === 'All') return sortedEvents;
        return sortedEvents.filter(event => event.city === selectedCity);
    }, [selectedCity, sortedEvents]);

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-10 max-w-5xl mx-auto relative overflow-hidden">
             {/* Ambient Background Glow - City Lights */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center">
                    <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700 text-amber-400 shadow-inner">
                        <CalendarIcon className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white ml-5 tracking-tight">Upcoming Events</h1>
                </div>
                <button
                    onClick={() => setCurrentPage('home')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors duration-300 group"
                    aria-label="Back to Home"
                >
                    <HomeIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold text-sm hidden md:block">Home</span>
                </button>
            </div>

            <div className="mb-10 p-1 bg-slate-800/50 rounded-xl inline-flex flex-col w-full md:w-auto">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Filter by Location</div>
                <div className="relative">
                    <select
                        id="city-filter"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full md:w-64 pl-4 pr-10 py-3 text-base bg-slate-900 border border-slate-700 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition appearance-none cursor-pointer"
                    >
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => <EventCard key={event.id} event={event} />)
                ) : (
                    <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                        <div className="inline-block p-4 bg-slate-800/50 rounded-full text-slate-500 mb-4">
                            <CalendarIcon className="h-8 w-8" />
                        </div>
                        <p className="text-slate-400 text-lg">No events scheduled for this location yet.</p>
                        <p className="text-slate-500 text-sm mt-2">Check back soon or select another city.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsCalendar;
