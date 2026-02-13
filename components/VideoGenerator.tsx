
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import VideoIcon from './icons/VideoIcon';
import UploadIcon from './icons/UploadIcon';

const loadingMessages = [
    "Warming up the video generator...",
    "Analyzing your image and prompt...",
    "Generating initial video frames...",
    "This can take a few minutes, please wait...",
    "Stitching frames together...",
    "Applying final touches...",
    "Almost there, finalizing the video...",
];

const VideoGenerator: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            // Check if we are in the AI Studio environment
            if (typeof window !== 'undefined' && (window as any).aistudio) {
                if (await (window as any).aistudio.hasSelectedApiKey()) {
                    setApiKeySelected(true);
                }
            } else {
                // In production/Cloud Run, assume the API key is configured via environment variables
                setApiKeySelected(true);
            }
        };
        checkApiKey();
    }, []);
    
    useEffect(() => {
        if (isLoading) {
            let messageIndex = 0;
            const interval = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 5000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [isLoading]);

    const handleSelectKey = async () => {
        if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            setApiKeySelected(true); // Assume success to avoid race condition
        }
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setGeneratedVideoUrl(null);
            setError(null);
            setImageMimeType(file.type);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const base64ToBytes = (dataUrl: string): string => dataUrl.split(',')[1];

    const handleGenerate = async () => {
        if (!image || !imageMimeType) {
            setError("Please upload a starting image.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt || "Animate this image.",
                image: {
                    imageBytes: base64ToBytes(image),
                    mimeType: imageMimeType,
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                 const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                 if (!videoResponse.ok) throw new Error("Failed to download generated video.");
                 const videoBlob = await videoResponse.blob();
                 setGeneratedVideoUrl(URL.createObjectURL(videoBlob));
            } else {
                throw new Error("Video generation completed, but no video URI was returned.");
            }

        } catch (err: any) {
            console.error("Error generating video:", err);
            let errorMessage = err.message || "An unexpected error occurred.";
            if (errorMessage.includes("Requested entity was not found.")) {
                errorMessage = "API Key error. The selected key may be invalid or missing permissions. Please try selecting a different API key.";
                // Only reset key state if we are in an environment that allows re-selection
                if ((window as any).aistudio) {
                    setApiKeySelected(false); 
                }
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!apiKeySelected) {
        return (
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center">
                <VideoIcon className="h-16 w-16 mx-auto text-amber-400 mb-4" />
                <h1 className="text-3xl font-serif font-bold text-white mb-4">API Key Required for Video Generation</h1>
                <p className="text-slate-300 mb-6">The Veo video generation model requires you to select your own API key. This is a one-time step.</p>
                <button
                    onClick={handleSelectKey}
                    className="px-6 py-3 bg-amber-500 text-slate-900 font-bold rounded-md hover:bg-amber-400 transition-colors"
                >
                    Select API Key
                </button>
                 <p className="text-xs text-slate-500 mt-4">
                    Please ensure your project has billing enabled. For more information, visit the{' '}
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">
                        billing documentation
                    </a>.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center mb-8">
                <div className="text-amber-400"><VideoIcon className="h-10 w-10" /></div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white ml-4 tracking-tight">Video Generator</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="video-image-upload" className="block text-md font-medium text-slate-300 mb-2">1. Upload a Starting Image</label>
                        <input
                            type="file"
                            id="video-image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500/10 file:text-amber-300 hover:file:bg-amber-500/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-md font-medium text-slate-300 mb-2">2. Add an Optional Prompt</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A gentle breeze makes the leaves rustle' or 'The scene becomes a neon hologram'."
                            className="w-full p-3 bg-slate-800 border border-slate-600 text-white rounded-md shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-400 resize-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <h3 className="block text-md font-medium text-slate-300 mb-2">3. Choose Aspect Ratio</h3>
                        <div className="flex space-x-2 rounded-lg bg-slate-800 p-1">
                            {(['16:9', '9:16'] as const).map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`w-full px-4 py-2 text-sm font-bold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                                        aspectRatio === ratio ? 'bg-slate-600 text-amber-300 shadow' : 'text-slate-300 hover:bg-slate-700/50'
                                    }`}
                                >
                                    {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                                </button>
                            ))}
                        </div>
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !image}
                        className="w-full flex items-center justify-center px-6 py-4 bg-amber-500 text-slate-900 font-bold rounded-md hover:bg-amber-400 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg"
                    >
                        Generate Video
                    </button>
                </div>
                {/* Display */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                    {isLoading ? (
                        <div className="text-center">
                             <svg className="animate-spin h-12 w-12 text-amber-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-lg font-semibold text-white">Generating Video...</p>
                            <p className="text-slate-400 mt-2">{loadingMessage}</p>
                        </div>
                    ) : generatedVideoUrl ? (
                         <video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-md" />
                    ) : image ? (
                        <img src={image} alt="Upload preview" className="max-w-full max-h-96 object-contain rounded-md" />
                    ) : (
                         <div className="text-center text-slate-500">
                            <UploadIcon className="h-12 w-12 mx-auto mb-2" />
                            <p>Upload an image to begin</p>
                        </div>
                    )}
                    {error && <div className="mt-4 p-4 w-full bg-red-900/50 text-red-200 border border-red-700 rounded-md text-sm">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default VideoGenerator;
