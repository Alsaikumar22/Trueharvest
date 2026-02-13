
import React, { useState, useEffect, useRef } from 'react';
import type { Page } from '../types';
import { createBibleChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import ChatIcon from './icons/ChatIcon';
import HomeIcon from './icons/HomeIcon';
import Logo from './Logo';

interface BibleChatProps {
    setCurrentPage: (page: Page) => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isStreaming?: boolean;
}

const suggestedQuestions = [
    "What does the Bible say about anxiety?",
    "Who is the Holy Spirit?",
    "How can I forgive someone who hurt me?",
    "Tell me about the fruits of the Spirit.",
    "What is the meaning of John 3:16?",
    "How should I pray?"
];

const BibleChat: React.FC<BibleChatProps> = ({ setCurrentPage }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Chat Session
    useEffect(() => {
        const session = createBibleChatSession();
        setChatSession(session);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || !chatSession) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Create a placeholder for the streaming response
            const modelMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isStreaming: true }]);

            const result = await chatSession.sendMessageStream({ message: textToSend });
            
            let fullText = '';
            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    setMessages(prev => prev.map(msg => 
                        msg.id === modelMsgId ? { ...msg, text: fullText } : msg
                    ));
                }
            }
            
            // Finalize message
            setMessages(prev => prev.map(msg => 
                msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
            ));

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: Message = { 
                id: (Date.now() + 2).toString(), 
                role: 'model', 
                text: "I apologize, I am having trouble consulting the scriptures right now. Please try again." 
            };
            setMessages(prev => prev.filter(m => !m.isStreaming).concat(errorMsg));
        } finally {
            setIsLoading(false);
        }
    };

    // Simple Markdown-like formatter for display
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => {
            // Headers
            if (line.startsWith('### ')) return <h3 key={i} className="text-amber-400 font-bold mt-2 mb-1">{line.replace('### ', '')}</h3>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-amber-400 font-bold text-lg mt-3 mb-2">{line.replace('## ', '')}</h2>;
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-white mb-2">{line.replace(/\*\*/g, '')}</p>;
            
            // Bullet points
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                return (
                    <div key={i} className="flex items-start ml-2 mb-1">
                        <span className="text-amber-500 mr-2">•</span>
                        <span>{formatInlineStyles(line.replace(/^[\*\-]\s/, ''))}</span>
                    </div>
                );
            }

            // Numbered lists
            if (/^\d+\.\s/.test(line.trim())) {
                 return (
                    <div key={i} className="flex items-start ml-2 mb-1">
                        <span className="text-amber-500 mr-2 font-bold">{line.match(/^\d+\./)?.[0]}</span>
                        <span>{formatInlineStyles(line.replace(/^\d+\.\s/, ''))}</span>
                    </div>
                );
            }

            // Empty lines
            if (!line.trim()) return <br key={i} />;

            return <p key={i} className="mb-2">{formatInlineStyles(line)}</p>;
        });
    };

    const formatInlineStyles = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-amber-200 font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const renderAvatar = (className: string) => {
        let fontSize = "text-xl";
        if (className.includes("w-32")) fontSize = "text-8xl";
        else if (className.includes("w-8")) fontSize = "text-lg";
        else if (className.includes("w-5")) fontSize = "text-sm";

        return (
            <div className={`bg-amber-500/20 rounded-full flex items-center justify-center ${fontSize} ${className}`}>
                👸
            </div>
        );
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden h-[85vh] flex flex-col max-w-5xl mx-auto relative">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between relative z-10">
                <div className="flex items-center">
                    <div className="p-2 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 mr-4">
                        {renderAvatar("w-8 h-8")}
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-bold text-white">Ask Junia 👧</h1>
                        <p className="text-xs text-slate-400 font-medium">Your Biblical Guide</p>
                    </div>
                </div>
                <button 
                    onClick={() => setCurrentPage('home')}
                    className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                    <HomeIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6 relative z-10">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                        {/* Lively Animated Girl */}
                        <div className="relative mb-6">
                            {renderAvatar("w-32 h-32 animate-bounce")}
                            <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 rounded-full"></div>
                        </div>
                        
                        <h2 className="text-2xl font-serif text-slate-300 mb-2">Hello Beloved in Christ</h2>
                        <p className="text-slate-500 max-w-sm mb-8 text-lg">I am Junia, I am here to help you, please let me know!</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                            {suggestedQuestions.map((q, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSend(q)}
                                    className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:border-amber-500/30 hover:text-amber-200 transition-all text-left"
                                >
                                    "{q}"
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <div 
                                key={msg.id} 
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`
                                    max-w-[95%] md:max-w-[75%] p-5 rounded-2xl text-sm md:text-base leading-relaxed shadow-md
                                    ${msg.role === 'user' 
                                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-sm' 
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                    }
                                `}>
                                    {msg.role === 'model' && (
                                        <div className="flex items-center mb-3 opacity-50 border-b border-white/10 pb-2">
                                            {renderAvatar("w-5 h-5 mr-2")}
                                            <span className="text-[10px] uppercase tracking-widest font-bold">Junia</span>
                                        </div>
                                    )}
                                    <div className="font-sans">
                                        {msg.role === 'user' ? msg.text : formatText(msg.text)}
                                    </div>
                                    {msg.isStreaming && (
                                        <div className="inline-block w-2 h-4 ml-1 bg-amber-500 animate-pulse align-middle"></div>
                                    )}
                                </div>
                                
                                {/* Translation Buttons for the latest response */}
                                {msg.role === 'model' && idx === messages.length - 1 && !msg.isStreaming && !isLoading && (
                                    <div className="flex gap-2 mt-2 ml-1">
                                        <button 
                                            onClick={() => handleSend("Translate the above response to Telugu")}
                                            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors flex items-center"
                                        >
                                            <span className="mr-1">ఆ</span> Telugu
                                        </button>
                                        <button 
                                            onClick={() => handleSend("Translate the above response to Tamil")}
                                            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors flex items-center"
                                        >
                                            <span className="mr-1">அ</span> Tamil
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 relative z-20">
                <div className="flex gap-3 max-w-4xl mx-auto">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Junia a biblical question..."
                        className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 p-4 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BibleChat;
