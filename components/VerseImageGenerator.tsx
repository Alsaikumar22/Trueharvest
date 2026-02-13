
import React, { useState } from 'react';
import { generateVerseImage } from '../services/geminiService';
import type { Page } from '../types';
import CreateIcon from './icons/CreateIcon';
import HomeIcon from './icons/HomeIcon';
import DownloadIcon from './icons/DownloadIcon';

interface VerseImageGeneratorProps {
    setCurrentPage: (page: Page) => void;
}

const VerseImageGenerator: React.FC<VerseImageGeneratorProps> = ({ setCurrentPage }) => {
    const [verseText, setVerseText] = useState('');
    const [reference, setReference] = useState('');
    const [style, setStyle] = useState('Cinematic & Realistic');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const styles = [
        "Cinematic & Realistic",
        "Oil Painting",
        "Watercolor",
        "Digital Art",
        "Stained Glass",
        "Minimalist Line Art",
        "Pencil Sketch",
        "3D Render"
    ];

    // Helper to overlay text onto the image using HTML5 Canvas
    const processImageWithOverlay = (dataUrl: string, text: string, ref: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            // Important for cross-origin issues if images were hosted externally, 
            // but base64 data URLs don't have this issue.
            img.crossOrigin = "anonymous"; 
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    resolve(dataUrl);
                    return;
                }

                // Set canvas to match image dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                // 1. Draw the Base Image
                ctx.drawImage(img, 0, 0);

                // 2. Add a Gradient Overlay at the bottom for text readability
                const gradient = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
                gradient.addColorStop(0, 'rgba(0,0,0,0)');       // Transparent
                gradient.addColorStop(0.6, 'rgba(0,0,0,0.6)');   // Darker
                gradient.addColorStop(1, 'rgba(0,0,0,0.9)');     // Darkest at bottom
                ctx.fillStyle = gradient;
                ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);

                // 3. Configure Font Styles
                // Responsive font size based on image width
                const fontSize = Math.floor(canvas.width * 0.045); 
                const padding = Math.floor(canvas.width * 0.05);
                
                // 4. Draw Verse Text
                ctx.font = `italic 700 ${fontSize}px "Cormorant Garamond", "Times New Roman", serif`;
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Add Shadow for better contrast
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Text Wrapping Logic
                const maxWidth = canvas.width - (padding * 2);
                const words = text.split(' ');
                let line = '';
                const lines = [];

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                // Calculate Position
                const lineHeight = fontSize * 1.5;
                const totalTextHeight = lines.length * lineHeight;
                // Position roughly in the bottom quarter
                let currentY = canvas.height - (canvas.height * 0.12) - totalTextHeight;

                lines.forEach(l => {
                    ctx.fillText(l.trim(), canvas.width / 2, currentY);
                    currentY += lineHeight;
                });

                // 5. Draw Reference
                const refFontSize = Math.floor(fontSize * 0.7);
                ctx.font = `700 ${refFontSize}px "Lato", "Arial", sans-serif`;
                ctx.fillStyle = '#fbbf24'; // Amber-400
                ctx.shadowBlur = 5;
                ctx.fillText(ref.toUpperCase(), canvas.width / 2, canvas.height - (canvas.height * 0.05));

                // Return new image data
                resolve(canvas.toDataURL('image/png'));
            };

            img.onerror = (err) => {
                console.error("Error processing image overlay", err);
                resolve(dataUrl); // Fallback to original image if canvas fails
            };

            img.src = dataUrl;
        });
    };

    const handleGenerate = async () => {
        if (!verseText.trim() || !reference.trim()) {
            setError("Please enter both the verse text and the reference (e.g., Genesis 1:1).");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const rawImageUrl = await generateVerseImage(verseText, reference, style);
            
            if (rawImageUrl) {
                // Apply the text overlay to the generated image
                const finalImage = await processImageWithOverlay(rawImageUrl, verseText, reference);
                setGeneratedImage(finalImage);
            } else {
                setError("Could not generate image. Please try a different verse or try again later.");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred while generating the image.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = `TrueHarvest-${reference.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-10 max-w-5xl mx-auto relative overflow-hidden">
             {/* Ambient Background Glow */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                     <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-amber-400">
                        <CreateIcon className="h-8 w-8" />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-3xl font-serif font-bold text-white">Scripture to Image</h1>
                        <p className="text-slate-400 text-sm">Visualize God's Word with AI.</p>
                    </div>
                </div>
                 <button
                    onClick={() => setCurrentPage('home')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <HomeIcon className="h-5 w-5" />
                    <span className="font-semibold text-sm hidden md:block">Home</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Bible Verse</label>
                        <textarea
                            value={verseText}
                            onChange={(e) => setVerseText(e.target.value)}
                            placeholder="e.g. In the beginning God created the heavens and the earth."
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition placeholder:text-slate-500 resize-none h-32"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Reference</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="e.g. Genesis 1:1"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition placeholder:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Art Style</label>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition cursor-pointer"
                            >
                                {styles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {error && <div className="p-4 bg-red-900/40 text-red-200 border border-red-700/50 rounded-xl text-sm">{error}</div>}

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-bold text-lg rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Creating & Writing...</span>
                            </div>
                        ) : (
                            "Generate Image"
                        )}
                    </button>
                    
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <p className="text-xs text-slate-400">
                            <strong>Tip:</strong> The app will automatically overlay your verse text onto the generated image so it is easy to read and share.
                        </p>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                    {generatedImage ? (
                        <>
                            <img 
                                src={generatedImage} 
                                alt={`Generated visualization of ${reference}`} 
                                className="w-full h-full object-contain max-h-[600px] z-10"
                            />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center space-x-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors shadow-xl"
                                >
                                    <DownloadIcon className="h-5 w-5" />
                                    <span>Download Image</span>
                                </button>
                            </div>
                        </>
                    ) : isLoading ? (
                        <div className="text-center p-8">
                             <div className="relative w-24 h-24 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                                <CreateIcon className="absolute inset-0 m-auto h-10 w-10 text-slate-500 animate-pulse" />
                             </div>
                             <p className="text-slate-300 font-serif text-xl animate-pulse">Painting your verse...</p>
                        </div>
                    ) : (
                        <div className="text-center p-8 opacity-50">
                            <CreateIcon className="h-20 w-20 mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-400 text-lg">Your generated image will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerseImageGenerator;
