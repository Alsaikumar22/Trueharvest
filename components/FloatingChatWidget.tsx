
import React, { useState, useEffect, useRef } from 'react';
import { createBibleChatSession } from '../services/geminiService';
import { Chat } from "@google/genai";
import XIcon from './icons/XIcon';

interface FloatingChatWidgetProps {
    isOpen: boolean;
    onToggle: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isStreaming?: boolean;
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ isOpen, onToggle }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const prompts = [
        "Need a verse for anxiety?",
        "Ask me about Faith.",
        "What does Psalm 23 mean?",
        "How do I pray?",
        "Who was David?"
    ];

    useEffect(() => {
        const session = createBibleChatSession();
        setChatSession(session);
    }, []);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isLoading]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || !chatSession) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
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
            
            setMessages(prev => prev.map(msg => 
                msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
            ));

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: Message = { 
                id: (Date.now() + 2).toString(), 
                role: 'model', 
                text: "I am having trouble connecting to the Word right now. Please try again." 
            };
            setMessages(prev => prev.filter(m => !m.isStreaming).concat(errorMsg));
        } finally {
            setIsLoading(false);
        }
    };

    const formatWidgetText = (text: string) => {
        return text.split('\n').map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            let cleanLine = line;
            if (line.startsWith('#')) cleanLine = line.replace(/^#+\s/, '');
            
            const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} className="mb-1">
                    {parts.map((part, idx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={idx} className="text-amber-200">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </div>
            );
        });
    };

    const renderAvatar = (className: string) => {
        // Map common width classes to reasonable font sizes
        let fontSize = "text-base";
        if (className.includes("w-20")) fontSize = "text-5xl";
        else if (className.includes("w-6")) fontSize = "text-sm";
        
        return (
            <div className={`bg-amber-100 rounded-full flex items-center justify-center ${fontSize} ${className}`}>
                👸
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-28 right-4 z-[100] w-80 md:w-96 h-[500px] max-h-[70vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeInUp origin-bottom-right">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-500/10 p-1.5 rounded-lg text-amber-400 relative">
                        {renderAvatar("w-6 h-6")}
                    </div>
                    <div>
                        <h3 className="text-white font-serif font-bold text-sm">Ask Junia 👸</h3>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider">Biblical AI Assistant</p>
                    </div>
                </div>
                <button onClick={onToggle} className="text-slate-400 hover:text-white transition-colors">
                    <XIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-900/50">
                {messages.length === 0 && (
                    <div className="text-center py-8 opacity-60">
                        <div className="relative inline-block mb-3">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl animate-bounce z-10">👑</div>
                            {renderAvatar("w-20 h-20 mx-auto")}
                            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">Hi!</div>
                        </div>
                        <p className="text-slate-400 text-xs">I am Junia. How can I help you today?</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {prompts.slice(0, 3).map((p, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleSend(p)}
                                    className="text-[10px] bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-amber-500 text-slate-900 font-medium rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'}`}>
                            {msg.role === 'user' ? msg.text : formatWidgetText(msg.text)}
                        </div>
                        {/* Translation Buttons for the last model message */}
                        {msg.role === 'model' && idx === messages.length - 1 && !msg.isStreaming && !isLoading && (
                            <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={() => handleSend("Translate the previous response to Telugu")}
                                    className="text-[10px] bg-slate-800/50 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700 px-2 py-1 rounded transition-colors"
                                >
                                    Telugu
                                </button>
                                <button 
                                    onClick={() => handleSend("Translate the previous response to Tamil")}
                                    className="text-[10px] bg-slate-800/50 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700 px-2 py-1 rounded transition-colors"
                                >
                                    Tamil
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-xl rounded-tl-sm border border-slate-700 flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a question..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 p-2 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloatingChatWidget;
