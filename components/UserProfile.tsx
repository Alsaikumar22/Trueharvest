
import React, { useState } from 'react';
import type { User, Page } from '../types';
import UserIcon from './icons/UserIcon';
import HomeIcon from './icons/HomeIcon';
import CheckIcon from './icons/CheckIcon';
import { requestNotificationPermission, forceSendDailyVerse } from '../services/notificationService';

interface UserProfileProps {
    user: User;
    onUpdateUser: (updatedUser: User) => void;
    setCurrentPage: (page: Page) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser, setCurrentPage }) => {
    const [displayName, setDisplayName] = useState(user.profile?.displayName || '');
    const [bio, setBio] = useState(user.profile?.bio || '');
    const [notificationsEnabled, setNotificationsEnabled] = useState(user.profile?.notificationsEnabled || false);
    const [avatar, setAvatar] = useState(user.profile?.avatar || 'bg-slate-700');
    const [isSaved, setIsSaved] = useState(false);
    const [isTestingNotify, setIsTestingNotify] = useState(false);

    const avatarOptions = [
        'bg-slate-700', 'bg-amber-500', 'bg-blue-500', 'bg-green-500', 
        'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
    ];

    const handleNotificationToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (checked) {
            const granted = await requestNotificationPermission();
            if (granted) {
                setNotificationsEnabled(true);
            } else {
                alert("Permission denied. Please enable notifications in your browser settings.");
                setNotificationsEnabled(false);
            }
        } else {
            setNotificationsEnabled(false);
        }
    };

    const handleTestNotification = async () => {
        setIsTestingNotify(true);
        const success = await forceSendDailyVerse();
        if (success) {
            alert("Notification sent! Please check your system tray.");
        } else {
            alert("Could not send notification. Please check permissions.");
        }
        setIsTestingNotify(false);
    };

    const handleSave = () => {
        const updatedProfile = {
            ...user.profile,
            displayName,
            bio,
            notificationsEnabled,
            avatar,
            streak: user.profile?.streak || 0,
            versesRead: user.profile?.versesRead || 0,
            lastNotificationDate: user.profile?.lastNotificationDate // Preserve this
        };

        onUpdateUser({ ...user, profile: updatedProfile });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const toggleAdminRole = () => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        onUpdateUser({ ...user, role: newRole });
        alert(`Role switched to ${newRole.toUpperCase()}. The Admin Dashboard access will now be ${newRole === 'admin' ? 'enabled' : 'disabled'}.`);
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-10 max-w-4xl mx-auto relative overflow-hidden animate-fadeInUp">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-amber-400">
                        <UserIcon className="h-8 w-8" />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-3xl font-serif font-bold text-white">Your Profile</h1>
                        <p className="text-slate-400 text-sm">Manage your account and preferences.</p>
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

            {/* Admin Quick Link */}
            {user.role === 'admin' && (
                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-500 rounded-lg text-slate-950 font-black text-xs">ADMIN</div>
                        <p className="text-amber-200 text-sm font-bold">You have administrative access.</p>
                    </div>
                    <button 
                        onClick={() => setCurrentPage('admin')}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                        Enter Admin Dashboard
                    </button>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Stats & Avatar Column */}
                <div className="md:col-span-1 space-y-6">
                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center">
                        <div className={`w-32 h-32 rounded-full ${avatar} flex items-center justify-center text-4xl font-serif font-bold text-white border-4 border-slate-800 shadow-xl`}>
                            {displayName.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <p className="mt-3 text-slate-400 text-sm font-medium uppercase tracking-widest">{user.role} Account</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
                        <div className="text-3xl font-bold text-amber-400 font-serif mb-1">{user.profile?.streak || 0}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Day Streak</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
                        <div className="text-3xl font-bold text-blue-400 font-serif mb-1">{user.profile?.versesRead || 0}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verses Read</div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Choose Avatar Color</label>
                        <div className="flex flex-wrap gap-3">
                            {avatarOptions.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setAvatar(color)}
                                    className={`w-8 h-8 rounded-full ${color} transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-slate-900 ${avatar === color ? 'ring-white' : 'ring-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-500"
                            placeholder="Enter your name"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Bio / Spiritual Goals</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-500 resize-none"
                            placeholder="Share a bit about your journey..."
                        />
                    </div>
                    
                    <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="font-bold text-white text-lg">Daily Verse Alerts</h3>
                                <p className="text-sm text-slate-400">Receive a browser notification for the Verse of the Day.</p>
                            </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={notificationsEnabled}
                                    onChange={handleNotificationToggle}
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between mt-4 border-t border-slate-700/50 pt-4">
                            <p className="text-xs text-slate-500 italic">
                                * Notification will be sent when you open the app or if the tab is active.
                            </p>
                            <button 
                                onClick={handleTestNotification}
                                disabled={isTestingNotify || !notificationsEnabled}
                                className="text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-sm"
                            >
                                {isTestingNotify ? "Sending..." : "Test Notification"}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-slate-700/50 mt-4">
                        <button
                            onClick={handleSave}
                            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
                        >
                            Save Changes
                        </button>
                        {isSaved && (
                            <span className="flex items-center text-green-400 animate-fadeIn">
                                <CheckIcon className="h-5 w-5 mr-2" /> Saved successfully
                            </span>
                        )}
                        <button 
                            onClick={toggleAdminRole}
                            className="ml-auto text-xs text-slate-600 hover:text-amber-500 underline"
                        >
                            {user.role === 'admin' ? 'Dev: Switch to Member' : 'Dev: Switch to Admin Mode'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
