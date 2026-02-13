
import React, { useState, useEffect } from 'react';
import { getVerseOfTheDay } from '../services/geminiService';
import type { VerseData } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import ShareIcon from './icons/ShareIcon';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full py-16">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-amber-500"></div>
  </div>
);

const VerseOfTheDay: React.FC = () => {
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        setLoading(true);
        const data = await getVerseOfTheDay();
        setVerseData(data);
      } catch (err) {
        setError('Failed to fetch the verse of the day. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
  }, []);

  const handleShare = () => {
    if (verseData) {
      // Fix: Access properties from the 'english' object within VerseData and include Source URL.
      const shareText = `Verse of the Day: "${verseData.english.verse}" - ${verseData.english.reference}\nSource: https://trueharvest.world`;
      if (navigator.share) {
        navigator.share({
          title: 'Verse of the Day - True Harvest',
          text: shareText,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('Verse copied to clipboard!');
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 max-w-5xl mx-auto ring-1 ring-slate-900/5">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 text-center tracking-tight">Verse of the Day</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !verseData) {
    return <div className="text-center p-8 text-red-700 bg-red-100 rounded-lg max-w-5xl mx-auto shadow-lg">{error || 'An unexpected error occurred.'}</div>;
  }

  // Fix: Destructure the 'english' verse content for easier and safer access.
  const { verse, reference, explanation, application, dos, donts } = verseData.english;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-10 max-w-5xl mx-auto ring-1 ring-slate-900/5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 tracking-tight">Verse of the Day</h1>
          {/* Fix: Use the 'reference' variable from the destructured object. */}
          <p className="text-xl text-slate-500 mt-2 font-serif">{reference}</p>
        </div>
        <button
          onClick={handleShare}
          className="p-3 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors duration-300"
          aria-label="Share verse"
        >
          <ShareIcon className="h-6 w-6" />
        </button>
      </div>

      <blockquote className="mt-8 bg-amber-100/50 border-l-4 border-amber-500 p-6 rounded-r-lg">
        <p className="text-2xl md:text-3xl italic text-slate-800 leading-snug">
          {/* Fix: Use the 'verse' variable. */}
          "{verse}"
        </p>
      </blockquote>

      <div className="mt-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-800 border-b-2 border-amber-300 pb-2 mb-4">Explanation</h2>
          {/* Fix: Use the 'explanation' variable. */}
          <p className="text-slate-600 text-lg leading-relaxed">{explanation}</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-800 border-b-2 border-amber-300 pb-2 mb-4">Daily Application</h2>
          {/* Fix: Use the 'application' variable. */}
          <p className="text-slate-600 text-lg leading-relaxed">{application}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          <div className="bg-green-50 rounded-lg p-5 ring-1 ring-green-200">
            <h3 className="text-xl font-bold font-serif text-green-800 mb-3">Do's</h3>
            <ul className="space-y-3">
              {/* Fix: Use the 'dos' array. */}
              {dos.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-green-900">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 rounded-lg p-5 ring-1 ring-red-200">
            <h3 className="text-xl font-bold font-serif text-red-800 mb-3">Don'ts</h3>
            <ul className="space-y-3">
              {/* Fix: Use the 'donts' array. */}
              {donts.map((item, index) => (
                <li key={index} className="flex items-start">
                  <XIcon className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-red-900">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerseOfTheDay;
