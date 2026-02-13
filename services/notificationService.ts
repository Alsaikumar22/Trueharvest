
import { getVerseOfTheDay } from './geminiService';
import type { User } from '../types';
import { triggerHaptic } from './nativeService';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const STORAGE_KEY = 'trueHarvestLastNotification';

export const requestNotificationPermission = async (): Promise<boolean> => {
    // 1. Native Platform (Android/iOS)
    if (Capacitor.isNativePlatform()) {
        try {
            const result = await LocalNotifications.requestPermissions();
            return result.display === 'granted';
        } catch (e) {
            console.error("Native notification permission request failed", e);
            return false;
        }
    }

    // 2. Web Platform
    if (!('Notification' in window)) {
        console.warn("This browser does not support desktop notifications");
        return false;
    }

    if (Notification.permission === 'granted') return true;

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (e) {
        console.error("Notification permission request failed", e);
        return false;
    }
};

export const sendNotification = async (title: string, body: string) => {
    // 1. Native Platform
    if (Capacitor.isNativePlatform()) {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: title,
                        body: body,
                        id: Math.floor(Math.random() * 100000), // Unique ID for testing/daily
                        schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay to ensure it triggers
                        sound: undefined,
                        attachments: undefined,
                        actionTypeId: "",
                        extra: null
                    }
                ]
            });
            triggerHaptic('notification');
        } catch (e) {
            console.error("Failed to schedule native notification", e);
        }
        return;
    }

    // 2. Web Platform
    if (Notification.permission === 'granted') {
        try {
            const options: any = {
                body: body,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                vibrate: [200, 100, 200],
                tag: 'daily-verse',
                renotify: true
            };
            
            // Try to use ServiceWorker registration if available for better mobile support
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options);
                }).catch(() => {
                    new Notification(title, options);
                });
            } else {
                new Notification(title, options);
            }
            
            triggerHaptic('notification');
        } catch (e) {
            console.error("Failed to send web notification", e);
        }
    }
};

export const checkAndSendDailyVerse = async (user: User | null) => {
    // 1. Check if user wants notifications
    if (user && !user.profile?.notificationsEnabled) return;

    // 2. Check permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    // 3. Check if already sent today
    const today = new Date().toISOString().split('T')[0];
    const lastSent = localStorage.getItem(STORAGE_KEY);

    if (lastSent === today) return;

    try {
        // 4. Fetch Verse
        const verseData = await getVerseOfTheDay();
        if (verseData && verseData.english) {
            const { verse, reference } = verseData.english;
            
            // Truncate for body
            const shortVerse = verse.length > 100 ? verse.substring(0, 100) + '...' : verse;
            
            await sendNotification("Verse of the Day", `"${shortVerse}" - ${reference}`);
            
            // 5. Mark as sent
            localStorage.setItem(STORAGE_KEY, today);
        }
    } catch (e) {
        console.error("Error fetching daily verse for notification", e);
    }
};

// Force send for testing purposes (ignores daily limit)
export const forceSendDailyVerse = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    try {
        const verseData = await getVerseOfTheDay();
        if (verseData && verseData.english) {
            const { verse, reference } = verseData.english;
            const shortVerse = verse.length > 100 ? verse.substring(0, 100) + '...' : verse;
            
            await sendNotification("Test: Verse of the Day", `"${shortVerse}" - ${reference}`);
            return true;
        }
    } catch (e) {
        console.error("Error sending test notification", e);
    }
    return false;
};
