
import React, { useState } from 'react';
import Logo from './Logo';
import type { UserProfile } from '../types';

interface LoginPageProps {
  onLogin: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  onRegister: (email: string, password?: string, rememberMe?: boolean, profile?: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  onGoogleLogin: () => Promise<{ success: boolean; message: string }>;
  onGuestAccess: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, onGoogleLogin, onGuestAccess, onBack }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!email) {
      setError('Please enter your email address.');
      setIsSubmitting(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('Please enter a valid email address (e.g., name@gmail.com).');
        setIsSubmitting(false);
        return;
    }

    if (!password) {
        setError('Please enter a password.');
        setIsSubmitting(false);
        return;
    }

    try {
        if (activeTab === 'signin') {
            const result = await onLogin(email, password);
            if (!result.success) {
                setError(result.message);
            }
        } else {
            if (!fullName) {
                setError('Please enter your full name for your profile.');
                setIsSubmitting(false);
                return;
            }

            const profileData = {
                displayName: fullName,
                bio: bio,
                notificationsEnabled: true,
                avatar: 'bg-slate-700'
            };

            const result = await onRegister(email, password, rememberMe, profileData);
            if (!result.success) {
                setError(result.message);
            } else {
                setSuccess(result.message);
            }
        }
    } catch (e) {
        setError("An unexpected error occurred. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950 relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

       {/* Back Button */}
       <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors z-20 group"
       >
          <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-amber-500 group-hover:text-slate-900 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0">Back</span>
       </button>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 animate-fadeInUp">
        <div className="mb-8 flex flex-col items-center text-center">
            <Logo svgClassName="w-16 h-16 text-amber-400 mb-4" showText={false} />
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide">
                Welcome Home
            </h1>
            <p className="text-slate-400 mt-2">Join the True Harvest community.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-slate-950/50 p-1 rounded-xl mb-8 relative">
            <button
                onClick={() => { setActiveTab('signin'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'signin' 
                    ? 'bg-slate-800 text-amber-400 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
            >
                Sign In
            </button>
            <button
                onClick={() => { setActiveTab('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'signup' 
                    ? 'bg-slate-800 text-amber-400 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
            >
                Sign Up
            </button>
        </div>

        <div className="space-y-4">
            
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sign Up Fields: Name & Bio */}
            {activeTab === 'signup' && (
                <>
                    <div className="animate-fadeIn">
                        <label htmlFor="fullname" className="block text-left text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Display Name
                        </label>
                        <input
                        id="fullname"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600"
                        placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="animate-fadeIn">
                        <label htmlFor="bio" className="block text-left text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Bio (Optional)
                        </label>
                        <input
                        id="bio"
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600"
                        placeholder="Spiritual goals or favorite verse..."
                        />
                    </div>
                </>
            )}

            <div>
                <label htmlFor="email" className="block text-left text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
                </label>
                <div className="relative">
                    <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600"
                    placeholder="name@gmail.com"
                    />
                </div>
            </div>
            
            <div>
                <label htmlFor="password" className="block text-left text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
                </label>
                <input
                id="password"
                name="password"
                type="password"
                autoComplete={activeTab === 'signin' ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                />
            </div>

            <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-400 border-slate-600 rounded bg-slate-900/50 cursor-pointer accent-amber-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300 cursor-pointer select-none">
                    Remember me
                </label>
            </div>

            {error && (
                <div className="text-sm text-red-200 bg-red-900/30 p-3 rounded-lg border border-red-800/50 animate-pulse">
                    <div className="flex items-center mb-1">
                        <span className="mr-2">⚠️</span>{error}
                    </div>
                    {/* Check for "password" (which is in "Invalid email or password") or "credential" (for safety) */}
                    {(error.includes("Invalid email") || error.includes("credential") || error.includes("password")) && activeTab === 'signin' && (
                        <p className="text-xs text-slate-300 ml-6">
                            Account not found? Please switch to 
                            <button 
                                type="button" 
                                onClick={() => { setActiveTab('signup'); setError(''); }} 
                                className="text-amber-400 font-bold hover:underline ml-1"
                            >
                                Sign Up
                            </button> to create a new account in our cloud database.
                        </p>
                    )}
                </div>
            )}
            
            {success && <div className="text-sm text-green-200 bg-green-900/30 p-3 rounded-lg border border-green-800/50 flex items-center"><span className="mr-2">✅</span>{success}</div>}

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    activeTab === 'signin' ? 'Sign In with Email' : 'Join Community'
                )}
            </button>

            <div className="pt-4 mt-2">
                    <p className="text-center text-xs text-slate-500 mb-3">Just browsing?</p>
                    <button
                        type="button"
                        onClick={onGuestAccess}
                        className="block w-full text-center text-sm font-bold text-slate-400 hover:text-amber-400 transition-colors py-2 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700"
                    >
                        Continue as Guest
                    </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
