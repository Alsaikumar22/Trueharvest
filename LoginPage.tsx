
import React, { useState } from 'react';
import Logo from './Logo';

interface LoginPageProps {
  onLogin: (email: string, password?: string) => { success: boolean; message: string };
  onRegister: (email: string, password?: string) => { success: boolean; message: string };
  onGuestAccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, onGuestAccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!password) {
        setError('Please enter a password.');
        return;
    }

    if (isLoginMode) {
        const result = onLogin(email, password);
        if (!result.success) {
            setError(result.message);
        }
    } else {
        const result = onRegister(email, password);
        if (!result.success) {
            setError(result.message);
        } else {
            // Auto login after successful registration logic is handled in App, 
            // but we can show success here if needed, or App will redirect.
            setSuccess(result.message);
        }
    }
  };

  const handleGoogleLogin = () => {
    // Simulate a Google Login flow
    const mockEmail = prompt("Simulating Google Auth: Enter your Gmail address", "user@gmail.com");
    if (mockEmail) {
        if (mockEmail.toLowerCase().includes('@gmail.com') || mockEmail.toLowerCase().includes('@googlemail.com')) {
            // For Google login, we might skip password or auto-register. 
            // Here we treat it as a register/login without password check for simplicity in demo
            const result = onRegister(mockEmail, 'google-auth'); 
             if (!result.success) {
                 // If already exists, try login
                 const loginRes = onLogin(mockEmail, 'google-auth');
                 if(!loginRes.success && loginRes.message !== "Incorrect password.") {
                     setError(loginRes.message);
                 }
             }
        } else {
            setError('Please use a valid Gmail address for Google Sign-In.');
        }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
            <Logo />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-white mb-2">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-slate-300 mb-8">
            {isLoginMode ? 'Sign in to access your digital sanctuary.' : 'Join our community for full access.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-left text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-500"
              placeholder="name@example.com"
            />
          </div>
          
           <div>
            <label htmlFor="password" className="block text-left text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400 text-left bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}
          {success && <p className="text-sm text-green-400 text-left bg-green-900/20 p-2 rounded border border-green-900/50">{success}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-colors"
            >
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="text-sm">
              <span className="text-slate-400">
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setError('');
                    setSuccess('');
                }}
                className="font-medium text-amber-400 hover:text-amber-300 underline"
              >
                  {isLoginMode ? "Sign Up" : "Sign In"}
              </button>
          </div>
          
          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">or</span>
              </div>
          </div>
          
           <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-600 rounded-lg shadow-sm text-base font-medium text-white bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            
            <button
                type="button"
                onClick={onGuestAccess}
                className="mt-6 text-sm text-slate-400 hover:text-white underline underline-offset-4 transition-colors w-full text-center"
            >
                Skip & Continue as Guest
            </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
