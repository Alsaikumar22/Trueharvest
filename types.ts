
export type BibleLanguage = 'english' | 'telugu' | 'tamil' | 'hindi' | 'arabic' | 'kannada' | 'malayalam' | 'marathi' | 'punjabi';
export type EnglishVersion = 'KJV' | 'NKJV' | 'ESV' | 'NASB' | 'NIV' | 'NLT' | 'ASV' | 'EHV' | 'AKJV' | 'AMP';

export interface Verse {
  [verseNumber: number]: string;
}

export interface Chapter {
  [chapterNumber: number]: Verse;
}

export interface BibleBook {
  [bookName: string]: Chapter;
}

export interface EnglishBible {
  KJV: BibleBook;
  NKJV: BibleBook;
  ESV: BibleBook;
  NASB: BibleBook;
  NIV: BibleBook;
  NLT: BibleBook;
  ASV: BibleBook;
  EHV: BibleBook;
  AKJV: BibleBook;
  AMP: BibleBook;
}

export interface BibleData {
  english: EnglishBible;
  telugu: BibleBook;
  tamil: BibleBook;
}

export type Page = 'home' | 'verse' | 'bible' | 'songs' | 'song' | 'events' | 'about' | 'admin' | 'profile' | 'plans' | 'create' | 'casestudies' | 'study' | 'introspection' | 'botanica' | 'video' | 'maps' | 'chat';

export interface VerseContent {
  verse: string;
  reference: string;
  explanation: string;
  application: string;
  dos: string[];
  donts: string[];
}

export interface VerseData {
  english: VerseContent;
  telugu: VerseContent;
  tamil: VerseContent;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string; // Tailwind class or URL
    text: string;
    timestamp: string; // ISO String
}

export interface Song {
  id?: string; // Added for database reference
  title: string;
  artist: string;
  album: string;
  year: number;
  language: 'English' | 'Telugu' | 'Tamil' | 'Hindi';
  category: string;
  lyricist: string;
  summary: string;
  background: string;
  theme: string;
  lyrics: string;
  englishLyrics?: string; // Optional: For transliteration of non-English songs
  youtubeUrl: string;
  spotifyUrl: string;
  imageUrl: string;
  likes?: number; // Cloud counter
}

export interface SongCategory {
  [language: string]: Song[];
}

export interface SongData {
  [category: string]: SongCategory;
}

export interface Event {
  id: number;
  title: string;
  date: string; // ISO format
  city: string;
  description: string;
}

export type UserRole = 'admin' | 'user';

export interface UserProfile {
    displayName?: string;
    bio?: string;
    notificationsEnabled: boolean;
    streak: number;
    versesRead: number;
    avatar?: string;
    lastNotificationDate?: string;
}

export interface User {
  email: string;
  role: UserRole;
  password?: string;
  profile?: UserProfile;
}

export interface BiblePlanDay {
    day: number;
    reference: string;
    completed: boolean;
}

export interface BiblePlan {
    id: string;
    title: string;
    description: string;
    days: number;
    schedule: BiblePlanDay[];
    imageUrl: string;
}

export interface UserPlanProgress {
    planId: string;
    startDate: string;
    completedDays: number[];
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    readBible: boolean;
    readVerse: boolean;
    prayed: boolean;
    worship: boolean;
    peaceScore: number; // 1-10
    minutesSpent: number; // New: time with God
}

export interface CharacterProfile {
    name: string;
    tagline: string;
    plant_type: string;
    origin: string;
    growth_story: string;
    key_fruit: string;
    thorns: string;
    scripture_ref: string;
}
