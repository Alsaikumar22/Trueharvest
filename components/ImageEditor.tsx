
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import ImageEditIcon from './icons/ImageEditIcon';
import UploadIcon from './icons/UploadIcon';

const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [originalMimeType, setOriginalMimeType] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setEditedImage(null);
            setError(null);
            setOriginalMimeType(file.type);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const blobToBase64 = (dataUrl: string): string => dataUrl.split(',')[1];

    const handleGenerate = async () => {
        if (!originalImage || !prompt || !originalMimeType) {
            setError("Please upload an image and enter a prompt.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Fix: responseModalities is not supported for nano banana series models during image editing.
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                data: blobToBase64(originalImage),
                                mimeType: originalMimeType,
                            },
                        },
                        { text: prompt },
                    ],
                },
            });
            
            // Find the image part, do not assume it is the first part.
            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                const base64ImageBytes: string = imagePart.inlineData.data;
                const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
                setEditedImage(imageUrl);
            } else {
                 throw new Error("No image was generated. The model may not have been able to fulfill the request.");
            }

        } catch (err: any) {
            console.error("Error generating image:", err);
            setError(err.message || "An unexpected error occurred while generating the image.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center mb-8">
                <div className="text-amber-400"><ImageEditIcon className="h-10 w-10" /></div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white ml-4 tracking-tight">Image Editor</h1>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg text-center">
                        <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                             <UploadIcon className="h-12 w-12 text-slate-400 mx-auto" />
                            <p className="mt-2 text-slate-300 font-semibold">
                                {originalImage ? "Change Image" : "Upload an Image"}
                            </p>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF, WEBP</p>
                        </label>
                    </div>

                    {/* Prompt Input */}
                    <div className="flex flex-col">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter a prompt to edit the image... e.g., 'Add a retro filter' or 'Make the background a snowy mountain'."
                            className="w-full flex-grow p-3 bg-slate-800 border border-slate-600 text-white rounded-md shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-400 resize-none"
                            rows={4}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !originalImage || !prompt}
                            className="mt-4 w-full flex items-center justify-center px-6 py-3 bg-amber-500 text-slate-900 font-bold rounded-md hover:bg-amber-400 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                                </>
                            ) : "Generate"}
                        </button>
                    </div>
                </div>

                {error && <div className="p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-md">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <h2 className="text-2xl font-serif text-white mb-2 text-center">Original</h2>
                        <div className="aspect-square bg-slate-800/50 rounded-lg flex items-center justify-center">
                            {originalImage ? (
                                <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain rounded-lg" />
                            ) : (
                                <p className="text-slate-500">Your image will appear here</p>
                            )}
                        </div>
                    </div>
                     <div>
                        <h2 className="text-2xl font-serif text-white mb-2 text-center">Edited</h2>
                        <div className="aspect-square bg-slate-800/50 rounded-lg flex items-center justify-center">
                             {isLoading ? (
                                <div className="flex flex-col items-center text-slate-400">
                                    <svg className="animate-spin h-10 w-10 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Editing...</span>
                                </div>
                            ) : editedImage ? (
                                <img src={editedImage} alt="Edited" className="max-w-full max-h-full object-contain rounded-lg" />
                            ) : (
                                <p className="text-slate-500">Your edited image will appear here</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
