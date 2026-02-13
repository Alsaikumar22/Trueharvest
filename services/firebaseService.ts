
/* =========================
   Firebase Compat Imports
========================= */
// We use /compat to allow the "firebase.auth()" style syntax with v10+ SDKs
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import type { User, UserProfile, Verse, Song, Comment } from "../types";

/* =========================
   Firebase Config
========================= */
const firebaseConfig = {
    apiKey: "AIzaSyBYrs7FCKLg0PL4tLYp08KQOabNGDiwVIk",
    authDomain: "trueharvest-alsk22.firebaseapp.com",
    projectId: "trueharvest-alsk22",
    storageBucket: "trueharvest-alsk22.firebasestorage.app",
    messagingSenderId: "863396487314",
    appId: "1:863396487314:web:14cc17f6eabccd6182464b"
};

/* =========================
   Init (SINGLETON)
========================= */
// Initialize Firebase only if it hasn't been initialized yet to avoid "Registry Locked" errors
if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}

export const app = firebase.app();
export const auth = firebase.auth();
export const db = firebase.firestore();

// Enable Offline Persistence
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open.');
    } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not supported by this browser.');
    }
});

/* =========================
   Constants
========================= */
const ADMIN_EMAIL = "trueharverst@gmail.com";

/* =========================
   Helpers
========================= */
const mapToInternalUser = async (firebaseUser: firebase.User): Promise<User | null> => {
    if (!firebaseUser.email) return null;

    const email = firebaseUser.email.toLowerCase();
    const ref = db.collection("users").doc(email);

    let role: "admin" | "user" = email === ADMIN_EMAIL ? "admin" : "user";
    let profile: any = {};

    try {
        const snap = await ref.get();

        if (snap.exists) {
            const data = snap.data();
            profile = data?.profile || {};
            if (email !== ADMIN_EMAIL) role = data?.role || "user";
            if (email === ADMIN_EMAIL && data?.role !== "admin") {
                await ref.update({ role: "admin" });
            }
        } else {
            profile = {
                displayName: firebaseUser.displayName || email.split("@")[0],
                streak: 0,
                versesRead: 0,
                notificationsEnabled: true,
                avatar: "bg-amber-500"
            };

            await ref.set({
                email,
                role,
                profile,
                createdAt: new Date().toISOString()
            });
        }
    } catch (e) {
        console.warn("User mapping failed (likely offline):", e);
        return { 
            email, 
            role, 
            profile: {
                displayName: firebaseUser.displayName || email.split("@")[0],
                notificationsEnabled: false,
                streak: 0,
                versesRead: 0,
                avatar: "bg-slate-700"
            }
        };
    }

    return { email, role, profile };
};

// Standard ID Generation for Writes
const generateBibleId = (lang: string, version: string, book: string, chapter: number | string) => {
    const sLang = lang.toLowerCase().trim();
    const sVersion = version.toLowerCase().trim(); 
    const sBook = book.trim().replace(/\s+/g, "_"); 
    const sChapter = chapter.toString();
    return `${sLang}_${sVersion}_${sBook}_${sChapter}`;
};

/* =========================
   Auth APIs
========================= */
export const subscribeToAuthChanges = (cb: (u: User | null) => void) =>
    auth.onAuthStateChanged(async (fbUser) => {
        cb(fbUser ? await mapToInternalUser(fbUser) : null);
    });

export const loginUser = async (email: string, pass: string) => {
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        return { success: true, message: "Welcome back." };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};

export const loginWithGoogle = async () => {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        return { success: true, message: "Logged in with Google." };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};

export const logoutUser = async () => auth.signOut();

export const registerUser = async (
    email: string,
    pass: string,
    profileData: Partial<UserProfile>
) => {
    try {
        await auth.createUserWithEmailAndPassword(email, pass);

        const ref = db.collection("users").doc(email.toLowerCase());
        await ref.set({
            email: email.toLowerCase(),
            role: email === ADMIN_EMAIL ? "admin" : "user",
            profile: {
                displayName: profileData.displayName || email.split("@")[0],
                bio: profileData.bio || "",
                streak: 0,
                versesRead: 0,
                notificationsEnabled: true,
                avatar: profileData.avatar || "bg-amber-500"
            },
            createdAt: new Date().toISOString()
        });

        return { success: true, message: "Registration successful." };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};

/* =========================
   Firestore APIs
========================= */
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const snapshot = await db.collection("users").get();
        return snapshot.docs.map(d => {
            const data = d.data();
            const email = data.email || d.id; 
            return { ...data, email } as User;
        });
    } catch (e) {
        console.error("Error fetching users", e);
        return [];
    }
};

export const updateUserRole = async (email: string, newRole: string) => {
    if (!email) throw new Error("Email is required");
    await db.collection("users").doc(email.toLowerCase()).update({ role: newRole });
};

export const deleteUserDoc = async (email: string) => {
    if (!email) throw new Error("Email is required");
    await db.collection("users").doc(email.toLowerCase()).delete();
};

export const fetchSongsFromFirestore = async (): Promise<Song[]> => {
    try {
        const snapshot = await db.collection("songs").get();
        return snapshot.docs.map(d => {
            const data = d.data();
            return { ...data, id: d.id } as Song;
        });
    } catch (e) {
        console.warn("Fetching songs failed (offline)", e);
        return [];
    }
};

export const fetchSongById = async (id: string): Promise<Song | null> => {
    try {
        const doc = await db.collection("songs").doc(id).get();
        if (doc.exists) {
            return { ...doc.data(), id: doc.id } as Song;
        }
        return null;
    } catch (e) {
        console.error("Error fetching song by ID", e);
        return null;
    }
};

export const addSongToFirestore = async (song: Song) => {
    const id = `${song.title}-${song.artist}`.replace(/[/\\?%*:|"<>]/g, "-");
    await db.collection("songs").doc(id).set(song);
};

export const updateSongInFirestore = async (song: Song) => {
    if (!song.id) throw new Error("Song ID is required for update");
    await db.collection("songs").doc(song.id).update(song);
};

export const deleteSongFromFirestore = async (song: Song) => {
    const id = song.id || `${song.title}-${song.artist}`.replace(/[/\\?%*:|"<>]/g, "-");
    await db.collection("songs").doc(id).delete();
};

export const subscribeToAppVersion = (cb: (versionData: any) => void) => {
    return db.collection("system_settings").doc("app_version").onSnapshot((doc) => {
        if (doc.exists) {
            cb(doc.data());
        }
    });
};

/* =========================
   Comment System APIs
========================= */
export const subscribeToSongComments = (songId: string, cb: (comments: Comment[]) => void) => {
    if (!songId) return () => {};
    const ref = db.collection("songs").doc(songId).collection("comments").orderBy("timestamp", "desc");
    const unsubscribe = ref.onSnapshot((snapshot) => {
        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Comment));
        cb(comments);
    }, (error) => {
        console.error("Comments subscription error:", error);
    });
    return unsubscribe;
};

export const addCommentToSong = async (songId: string, comment: Omit<Comment, 'id'>) => {
    if (!songId) throw new Error("Invalid Song ID");
    const ref = db.collection("songs").doc(songId).collection("comments");
    await ref.add(comment);
};

// Bulk fetch for Offline Download Feature
export const fetchBookChapters = async (
    lang: string,
    book: string,
    version: string
): Promise<{ chapter: number, verses: Verse }[]> => {
    const sLang = lang.toLowerCase().trim();
    const sVersion = version.toLowerCase().trim();
    const cleanBook = book.trim();

    try {
        let q = db.collection("bible_chapters")
            .where("language", "==", sLang);

        // Handle Psalm vs Psalms interchangeably
        if (cleanBook === 'Psalm' || cleanBook === 'Psalms') {
             q = q.where("book", "in", ["Psalm", "Psalms"]);
        } else {
             q = q.where("book", "==", cleanBook);
        }

        // Only filter by version for English
        if (sLang === 'english') {
            q = q.where("version", "==", sVersion);
        }

        const querySnapshot = await q.get();
        if (querySnapshot.empty) return [];

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                chapter: data.chapter,
                verses: data.verses as Verse
            };
        });
    } catch (e) {
        console.error("Bulk Fetch Error:", e);
        return [];
    }
};

export const fetchChapterFromFirestore = async (
    lang: string,
    book: string,
    chapter: number,
    version: string
): Promise<Verse | null> => {
    const sLang = lang.toLowerCase().trim();
    const sVersion = version.toLowerCase().trim(); 
    const sChapterStr = chapter.toString();
    const cleanBook = book.trim();
    const cleanBookId = cleanBook.replace(/\s+/g, "_");

    const idsToTry: string[] = [];

    // 1. Direct ID Access Optimization
    if (sLang === 'english') {
        // English always uses version in ID
        idsToTry.push(`${sLang}_${sVersion}_${cleanBookId}_${sChapterStr}`);
        idsToTry.push(`${sLang}_${sVersion}_${cleanBook.replace(/\s+/g, "")}_${sChapterStr}`);
        
        if (cleanBook === 'Psalm' || cleanBook === 'Psalms') {
             idsToTry.push(`${sLang}_${sVersion}_Psalms_${sChapterStr}`);
             idsToTry.push(`${sLang}_${sVersion}_Psalm_${sChapterStr}`);
        }
    } else {
        // Non-English Handling
        // User reports format: telugu_Psalms_2
        
        // A. Prioritize Psalms plural if it's the book
        if (cleanBook === 'Psalm' || cleanBook === 'Psalms') {
            idsToTry.push(`${sLang}_Psalms_${sChapterStr}`);      // e.g. telugu_Psalms_2
            idsToTry.push(`${sLang}_Psalm_${sChapterStr}`);       // e.g. telugu_Psalm_2
            idsToTry.push(`${sLang}_${sVersion}_Psalms_${sChapterStr}`); 
            idsToTry.push(`${sLang}_BSI_Psalms_${sChapterStr}`);  
        }

        // B. Standard Patterns (Language_Book_Chapter)
        idsToTry.push(`${sLang}_${cleanBookId}_${sChapterStr}`); // e.g. telugu_Genesis_1
        idsToTry.push(`${sLang}_${sVersion}_${cleanBookId}_${sChapterStr}`); 
        idsToTry.push(`${sLang}_BSI_${cleanBookId}_${sChapterStr}`);
    }

    for (const id of idsToTry) {
        try {
            const snap = await db.collection("bible_chapters").doc(id).get();
            if (snap.exists) {
                return snap.data()?.verses as Verse;
            }
        } catch (e) {
            // Ignore missing docs
        }
    }

    // 2. Fallback: Dynamic Query
    // This catches documents even if ID naming convention varies (e.g. spaces, different separators)
    try {
        let q = db.collection("bible_chapters")
            .where("chapter", "==", chapter); 

        // Handle Psalm vs Psalms logic dynamically
        if (cleanBook === 'Psalm' || cleanBook === 'Psalms') {
            q = q.where("book", "in", ["Psalm", "Psalms"]);
        } else {
            q = q.where("book", "==", cleanBook);
        }

        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            return null;
        }

        // Filter based on Language and Version (for English)
        const match = querySnapshot.docs.find(doc => {
            const data = doc.data();
            const dataLang = (data.language || "").toLowerCase();
            const dataVersion = (data.version || "").toLowerCase();
            
            if (dataLang !== sLang) return false;

            if (sLang === 'english') {
                return dataVersion === sVersion;
            } else {
                return true; // Return first match for non-English
            }
        });

        if (match) {
            return match.data().verses as Verse;
        }

    } catch (e) {
        console.error("[Firestore] Dynamic Query Error:", e);
    }

    return null;
};

export const bulkSaveChaptersToFirestore = async (tasks: any[]) => {
    const batchSize = 25;

    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = db.batch();

        tasks.slice(i, i + batchSize).forEach(t => {
            const id = generateBibleId(t.lang, t.version, t.book, t.chapter);
            const ref = db.collection("bible_chapters").doc(id);
            batch.set(ref, {
                ...t,
                version: t.version.toLowerCase(),
                updatedAt: new Date().toISOString()
            });
        });

        await batch.commit();
        await new Promise(r => setTimeout(r, 1000));
    }
    return true;
};

export const syncUserProfile = async (user: User) => {
    if (!user.email) return;
    const ref = db.collection("users").doc(user.email.toLowerCase());
    await ref.update({
        profile: user.profile,
        role: user.role
    });
};

/* =========================
   Config Helpers
========================= */
export const getFirebaseConfig = () => {
    return firebase.app().options as any;
};

export const getFirebaseApp = () => app;
