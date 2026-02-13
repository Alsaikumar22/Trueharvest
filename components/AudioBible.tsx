
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateSpeech } from '../services/geminiService';
import { fetchBibleChapter } from '../services/bibleService';
import type { Page, BibleLanguage, EnglishVersion, Verse } from '../types';
import { BIBLE_BOOK_GROUPS_EN } from '../services/constants';
import HomeIcon from './icons/HomeIcon';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import HeadphonesIcon from './icons/HeadphonesIcon';

// --- Pure Helper Functions (Top Level) ---

function decodeBase64(base64: string): Uint8Array {
  try {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  } catch (e) {
      console.error("Audio Decode Error", e);
      return new Uint8Array(0);
  }
}

async function decodePcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Use byteOffset and length / 2 to safely view the buffer as Int16 even if offset is odd
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.length / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const renderSafeText = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return content.toString();
    if (content === null || content === undefined) return "";
    if (typeof content === 'object') {
        try {
            if (content.text && typeof content.text === 'string') return content.text;
            return JSON.stringify(content);
        } catch (e) {
            return "[Invalid Content]";
        }
    }
    return String(content);
};

interface AudioBibleProps {
    setCurrentPage: (page: Page) => void;
}

const AudioBible: React.FC<AudioBibleProps> = ({ setCurrentPage }) => {
    const [book, setBook] = useState('Psalm');
    const [chapter, setChapter] = useState(23);
    const [version, setVersion] = useState<EnglishVersion>('KJV');
    const [language, setLanguage] = useState<BibleLanguage>('english');
    
    const [chapterContent, setChapterContent] = useState<Verse | null>(null);
    const [isLoadingText, setIsLoadingText] = useState(false);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerse, setCurrentVerse] = useState<number>(1);
    const [totalVerses, setTotalVerses] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Fetch Text Content whenever Book/Chapter changes
    useEffect(() => {
        const fetchText = async () => {
            setIsLoadingText(true);
            stopAudio();
            setChapterContent(null);
            
            try {
                const { data } = await fetchBibleChapter(language, book, chapter, version);
                if (data) {
                    setChapterContent(data);
                    const vNums = Object.keys(data).map(Number).sort((a,b) => a-b);
                    setTotalVerses(vNums.length);
                    setCurrentVerse(vNums[0] || 1);
                }
            } catch (e) {
                console.error("Bible fetch error", e);
            } finally {
                setIsLoadingText(false);
            }
        };
        fetchText();
        
        return () => stopAudio();
    }, [book, chapter, version, language]);

    const stopAudio = useCallback(() => {
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
                sourceRef.current.disconnect();
            } catch(e) {}
            sourceRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const playVerse = async (verseNum: number) => {
        // STRICT RULE: Audio is available ONLY for English
        if (language !== 'english') {
            setIsPlaying(false);
            return;
        }

        if (!chapterContent || !chapterContent[verseNum]) {
            setIsPlaying(false);
            return;
        }

        try {
            // Use system default sample rate for Android compatibility
            if (!audioContextRef.current) {
                const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioCtor();
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            const ctx = audioContextRef.current;
            if (!ctx) throw new Error("AudioContext initialization failed");

            const text = renderSafeText(chapterContent[verseNum]);
            
            // Generate Speech
            const base64Audio = await generateSpeech(text);
            
            if (!base64Audio) throw new Error("No audio returned from service");

            const bytes = decodeBase64(base64Audio);
            
            // Note: 24000 is the sample rate of the AUDIO DATA from Gemini
            // The context handles resampling to system rate automatically
            const audioBuffer = await decodePcmToAudioBuffer(bytes, ctx, 24000, 1);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
                if (verseNum < totalVerses) {
                    const nextV = verseNum + 1;
                    setCurrentVerse(nextV);
                    playVerse(nextV);
                } else {
                    setIsPlaying(false);
                    setCurrentVerse(1);
                }
            };
            
            sourceRef.current = source;
            source.start(0);

        } catch (error) {
            console.error("Audio Playback Error:", error);
            setIsPlaying(false);
            alert("Unable to play audio. Please ensure you are connected to the internet.");
        }
    };

    const togglePlay = () => {
        if (language !== 'english') return;
        
        if (isPlaying) {
            stopAudio();
        } else {
            setIsPlaying(true);
            playVerse(currentVerse);
        }
    };

    const handleNext = () => {
        stopAudio();
        if (currentVerse < totalVerses) {
            const nextV = currentVerse + 1;
            setCurrentVerse(nextV);
            if (isPlaying && language === 'english') playVerse(nextV); 
        } else {
             setChapter(prev => prev + 1);
        }
    };

    const handlePrev = () => {
         stopAudio();
         if (currentVerse > 1) {
             setCurrentVerse(prev => prev - 1);
         } else if (chapter > 1) {
             setChapter(prev => prev - 1);
         }
    };

    const isEnglish = language === 'english';

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-10 max-w-4xl mx-auto relative overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex items-center">
                    <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-amber-400">
                        <HeadphonesIcon className="h-8 w-8" />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-3xl font-serif font-bold text-white">Audio Bible</h1>
                        <p className="text-slate-400 text-sm">Listen to the Word.</p>
                    </div>
                </div>
                 <button
                    onClick={() => { stopAudio(); setCurrentPage('home'); }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <HomeIcon className="h-5 w-5" />
                    <span className="font-semibold text-sm hidden md:block">Home</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-8 justify-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                 <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2"
                >
                    <option value="english">English</option>
                    <option value="telugu">Telugu</option>
                    <option value="tamil">Tamil</option>
                    <option value="hindi">Hindi</option>
                    <option value="kannada">Kannada</option>
                    <option value="malayalam">Malayalam</option>
                </select>

                <select 
                    value={book}
                    onChange={(e) => { setBook(e.target.value); setChapter(1); }}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2"
                >
                    {Object.keys(BIBLE_BOOK_GROUPS_EN).map(group => (
                        <optgroup key={group} label={group}>
                            {BIBLE_BOOK_GROUPS_EN[group].map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                    <button onClick={() => setChapter(c => Math.max(1, c-1))} className="px-3 py-2 hover:bg-slate-800 text-slate-300">-</button>
                    <span className="px-3 py-2 text-white font-bold min-w-[3rem] text-center">{chapter}</span>
                    <button onClick={() => setChapter(c => c+1)} className="px-3 py-2 hover:bg-slate-800 text-slate-300">+</button>
                </div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center space-y-8 relative">
                {isLoadingText ? (
                     <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
                ) : (
                    <>
                        <div className="text-center space-y-4 max-w-2xl px-4">
                            <h2 className="text-4xl font-serif font-bold text-white">{book} {chapter}</h2>
                            <div className="h-48 overflow-y-auto custom-scrollbar p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                                <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-serif italic transition-all duration-300">
                                    "{renderSafeText(chapterContent?.[currentVerse]) || "Text unavailable for this selection."}"
                                </p>
                                <p className="text-sm text-amber-500 font-bold mt-4 tracking-widest uppercase">Verse {currentVerse}</p>
                            </div>
                        </div>

                        {/* ONLY RENDER CONTROLS IF ENGLISH IS SELECTED */}
                        {isEnglish ? (
                            <>
                                <div className="w-full max-w-lg space-y-2">
                                     <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                         <div 
                                            className="h-full bg-amber-500 transition-all duration-300" 
                                            style={{ width: `${totalVerses > 0 ? (currentVerse / totalVerses) * 100 : 0}%`}}
                                        ></div>
                                     </div>
                                     <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
                                         <span>Verse 1</span>
                                         <span>Verse {totalVerses}</span>
                                     </div>
                                </div>

                                <div className="flex items-center space-x-8">
                                     <button onClick={handlePrev} className="p-4 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                         <ChevronDownIcon className="h-8 w-8 rotate-90" />
                                     </button>

                                     <button 
                                        onClick={togglePlay}
                                        disabled={!chapterContent}
                                        className={`p-6 rounded-full bg-amber-500 text-slate-900 hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] ${!chapterContent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                     >
                                         {isPlaying ? <PauseIcon className="h-10 w-10" /> : <PlayIcon className="h-10 w-10 ml-1" />}
                                     </button>

                                     <button onClick={handleNext} className="p-4 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                         <ChevronDownIcon className="h-8 w-8 -rotate-90" />
                                     </button>
                                </div>
                            </>
                        ) : (
                            <div className="mt-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center max-w-lg">
                                <h3 className="text-red-400 font-bold font-serif text-lg mb-2">Audio Unavailable</h3>
                                <p className="text-slate-400 text-sm">
                                    The Audio Bible is currently available only for the <strong>English</strong> Bible. 
                                    Please switch the language to English to listen.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AudioBible;
