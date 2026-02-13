
/**
 * Native Service for Capacitor/Android functionality.
 * This gracefully fails when running in a web browser.
 */
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const triggerHaptic = async (type: 'impact' | 'notification' | 'selection' = 'selection') => {
    if (!isNative) return;
    try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        if (type === 'impact') {
            await Haptics.impact({ style: ImpactStyle.Light });
        } else if (type === 'notification') {
            await Haptics.notification();
        } else {
            await Haptics.selectionStart();
        }
    } catch (e) {
        // Fallback for missing plugin
    }
};

export const initializeNativeStyles = async () => {
    if (!isNative) return;
    try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#020617' });
    } catch (e) {
        // Fallback for missing plugin
    }
};

export const setStatusBarStyle = async (theme: 'dark' | 'light') => {
    if (!isNative) return;
    try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        // In Capacitor, Style.Dark makes text light (for dark backgrounds)
        // Style.Light makes text dark (for light backgrounds)
        const style = theme === 'dark' ? Style.Dark : Style.Light;
        const color = theme === 'dark' ? '#020617' : '#f8fafc';
        
        await StatusBar.setStyle({ style });
        await StatusBar.setBackgroundColor({ color });
    } catch (e) {
        console.warn("Status Bar update failed", e);
    }
};

export const setupKeyboardListeners = async () => {
    if (!isNative) return;
    try {
        const { Keyboard } = await import('@capacitor/keyboard');
        // This is useful for adjusting fixed-bottom elements
        Keyboard.addListener('keyboardWillShow', () => {
            document.body.classList.add('keyboard-open');
        });
        Keyboard.addListener('keyboardWillHide', () => {
            document.body.classList.remove('keyboard-open');
        });
    } catch (e) {
        // Fallback for missing plugin
    }
};
