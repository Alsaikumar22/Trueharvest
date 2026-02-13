
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import type { VerseData, Verse, CharacterProfile } from '../types';

// Helper to safely get the API key from the global scope polyfill
const getApiKey = () => {
    // Check multiple locations for the API key to be robust
    return (typeof process !== 'undefined' && process.env?.API_KEY) || 
           (window as any).process?.env?.API_KEY || 
           '';
};

const cleanJson = (text: string): string => {
    if (!text) return "{}";
    
    // 1. Try to find markdown block
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) return match[1].trim();

    // 2. If no block, try to find raw JSON object start and end
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        return text.substring(firstOpen, lastClose + 1);
    }

    // 3. Fallback: aggressive strip
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const getVerseOfTheDay = async (): Promise<VerseData> => {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const STORAGE_KEY = 'trueHarvestDailyVerse';

    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.date === todayKey && parsed.data) {
                return parsed.data as VerseData;
            }
        }
    } catch (e) {
        console.warn("Could not access localStorage for verse cache");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const dateContext = `Today is ${today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`;

        const verseContentSchema = {
            type: Type.OBJECT,
            properties: {
                verse: { type: Type.STRING, description: "The full text of the Bible verse." },
                reference: { type: Type.STRING, description: "The book, chapter, and verse number." },
                explanation: { type: Type.STRING, description: "A simple explanation." },
                application: { type: Type.STRING, description: "Practical daily application." },
                dos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Short actionable 'Do's'." },
                donts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Short actionable 'Don'ts'." },
            },
            required: ["verse", "reference", "explanation", "application", "dos", "donts"]
        };

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                role: "user",
                parts: [{ text: `${dateContext} Provide a unique Bible verse of the day in English, Telugu, and Tamil.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        english: verseContentSchema,
                        telugu: verseContentSchema,
                        tamil: verseContentSchema,
                    },
                    required: ["english", "telugu", "tamil"]
                }
            },
        });

        // Correct usage: .text property, not method
        const jsonText = response.text;
        if (!jsonText) throw new Error("No text returned from API");

        const data = JSON.parse(cleanJson(jsonText)) as VerseData;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, data: data }));
        } catch (e) {}
        
        return data;
    } catch (error) {
        console.error("Verse fetch error", error);
        // Fallback data if API fails
        return {
            english: { verse: "For God so loved the world...", reference: "John 3:16", explanation: "...", application: "...", dos: ["..."], donts: ["..."] },
            telugu: { verse: "దేవుడు లోకమును ఎంతో ప్రేమించెను...", reference: "యోహాను 3:16", explanation: "...", application: "...", dos: ["..."], donts: ["..."] },
            tamil: { verse: "தேவன், தம்முடைய ஒரேபேறான குமாரனை...", reference: "யோவான் 3:16", explanation: "...", application: "...", dos: ["..."], donts: ["..."] }
        };
    }
};

/**
 * DEPRECATED: Direct AI generation of full chapters is disabled.
 * Content must come from Firestore/Static sources.
 */
export const getBibleChapter = async (language: string, book: string, chapter: number, version: string = 'KJV'): Promise<Verse | null> => {
    console.warn("AI generation of Bible chapters is disabled to ensure data integrity.");
    return null; 
}

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: {
                role: "user",
                parts: [{ text }] 
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        });
        const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return audioPart?.inlineData?.data || null;
    } catch (error) {
        console.error("Speech generation error", error);
        return null;
    }
};

export const generateBibleStudy = async (query: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                role: "user",
                parts: [{ text: `You are a Bible study assistant. Query: "${query}".` }]
            },
        });
        return response.text || "No insights available.";
    } catch (error) {
        return "Sorry, I couldn't generate the study notes.";
    }
};

export const generateVerseSummary = async (verseText: string, reference: string, language: string = 'english'): Promise<{ key_word: string, summary: string, cross_references: { ref: string, text: string }[] } | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        
        let prompt = `Analyze the Bible verse ${reference}.`;
        if (verseText && verseText.trim().length > 0) {
            prompt += ` Text: "${verseText}".`;
        }
        prompt += ` Return a 'key_word' (1-2 words), a 'summary' (1 sentence), and 'cross_references' (array of 3-5 objects with 'ref' and short 'text') in ${language}.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: {
                role: "user",
                parts: [{ text: prompt }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        key_word: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        cross_references: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: {
                                    ref: { type: Type.STRING },
                                    text: { type: Type.STRING }
                                },
                                required: ["ref", "text"]
                            } 
                        }
                    },
                    required: ["key_word", "summary", "cross_references"]
                }
            },
        });
        
        const text = response.text;
        if (!text) {
            console.error("Gemini API returned empty text for verse summary.");
            throw new Error("No response text from AI");
        }
        
        const cleaned = cleanJson(text);
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Verse Summary Error:", error);
        return null;
    }
};

export const generateCaseStudy = async (topic: string): Promise<any> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                role: "user",
                parts: [{ text: `Create a detailed biblical case study on: "${topic}".` }]
            },
            config: {
                responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        scripture_reference: { type: Type.STRING },
                        background: { type: Type.STRING },
                        key_events: { type: Type.ARRAY, items: { type: Type.STRING } },
                        significance: { type: Type.STRING },
                        lessons: { type: Type.ARRAY, items: { type: Type.STRING } },
                        reflection_question: { type: Type.STRING }
                    },
                    required: ["title", "scripture_reference", "background", "key_events", "significance", "lessons", "reflection_question"]
                }
            },
        });
        return JSON.parse(cleanJson(response.text || "{}"));
    } catch (error) {
        throw error;
    }
};

export const generateVerseImage = async (verse: string, reference: string, style: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: {
                role: "user",
                parts: [{ text: `Majestic cinematic visual for: "${verse}" (${reference}). Style: ${style}. No text.` }] 
            },
        });
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        return null; 
    } catch (error) {
        console.error("Image generation error", error);
        throw error;
    }
};

export const getCharacterProfile = async (characterName: string, language: string = 'english'): Promise<CharacterProfile> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                role: "user",
                parts: [{ text: `Create a "Garden Profile" for "${characterName}" in ${language}.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        tagline: { type: Type.STRING },
                        plant_type: { type: Type.STRING },
                        origin: { type: Type.STRING },
                        key_fruit: { type: Type.STRING },
                        growth_story: { type: Type.STRING },
                        thorns: { type: Type.STRING },
                        scripture_ref: { type: Type.STRING }
                    },
                    required: ["name", "tagline", "plant_type", "origin", "growth_story", "key_fruit", "thorns", "scripture_ref"]
                }
            },
        });
        return JSON.parse(cleanJson(response.text || "{}"));
    } catch (error) {
        throw error;
    }
};

export const generateSongInsight = async (title: string, artist: string, lyrics: string, language: string = 'English'): Promise<{ summary: string, theme: string } | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                role: "user",
                parts: [{ text: `Analyze song "${title}" by ${artist}. Result in ${language}.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        theme: { type: Type.STRING }
                    },
                    required: ["summary", "theme"]
                }
            },
        });
        return JSON.parse(cleanJson(response.text || "{}"));
    } catch (error) {
        return null;
    }
};

export const generateBibleMapInfo = async (query: string): Promise<{ text: string, chunks: any[] } | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                role: "user",
                parts: [{ text: `You are a biblical geography expert. Provide detailed historical context for: "${query}".` }]
            },
            config: {
                tools: [{ googleSearch: {} }], 
            },
        });
        
        return {
            text: response.text || "No detailed information found.",
            chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    } catch (error) {
        console.error("Map Generation Error:", error);
        return null;
    }
};

export interface JournalAnalysis {
    emotion: string;
    comfort_verse: string;
    reference: string;
    prayer_strategy: string;
}

export const analyzeJournalEntry = async (entry: string): Promise<JournalAnalysis | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                role: "user",
                parts: [{ text: `Analyze this spiritual journal entry: "${entry}". Detect the core emotion/need. Provide a comforting bible verse and a short 1-sentence prayer strategy.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        emotion: { type: Type.STRING },
                        comfort_verse: { type: Type.STRING },
                        reference: { type: Type.STRING },
                        prayer_strategy: { type: Type.STRING }
                    },
                    required: ["emotion", "comfort_verse", "reference", "prayer_strategy"]
                }
            },
        });
        return JSON.parse(cleanJson(response.text || "{}"));
    } catch (error) {
        console.error("Journal Analysis Error", error);
        return null;
    }
};

// Create a Chat Session for the Bible Chat Bot
export const createBibleChatSession = (): Chat => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    return ai.chats.create({
        model: "gemini-3-pro-preview",
        config: {
            systemInstruction: `You are 'Junia', a wise, compassionate, and strictly biblical AI pastoral assistant.
            
            IMPORTANT LANGUAGE RULES:
            1. Provide responses in **English** ONLY by default.
            2. Do NOT provide translations (Telugu, Tamil, etc.) in your initial response.
            3. Do NOT provide multiple languages simultaneously.
            4. If the user clicks a translation button, you will receive a prompt like "Translate to Telugu". Only THEN provide the translation.
            
            STRUCTURE & FORMATTING RULES:
            1. Use **Markdown** to format your response clearly.
            2. Use **bold** for key biblical terms or verses.
            3. Use *bullet points* or numbered lists for steps, principles, or lists of verses. 
            4. Keep paragraphs short and readable.
            5. Do NOT output large, unbroken blocks of text.
            
            CONTENT RULES:
            1. Support every major claim with a specific Bible reference (Book Chapter:Verse).
            2. Use a warm, encouraging, and pastoral tone.
            3. If a question is about politics, sports, coding, or non-spiritual topics, politely redirect the user to God's Word.
            4. Do not hallucinate verses. Use standard translations (KJV, ESV, NIV context).
            5. Provide practical application where appropriate.
            6. Keep answers concise but spiritually deep.`,
        }
    });
};
