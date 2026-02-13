
import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import BibleReader from './components/BibleReader';
import SongLibrary from './components/SongLibrary';
import EventsCalendar from './components/EventsCalendar';
import VerseOfTheDayPage from './components/VerseOfTheDayPage';
import AboutPage from './components/AboutPage';
import LoginPage from './components/LoginPage';
import WelcomePage from './components/WelcomePage';
import UserProfileComponent from './components/UserProfile';
import BiblePlans from './components/BiblePlans';
import VerseImageGenerator from './components/VerseImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import CaseStudies from './components/CaseStudies';
import AdminDashboard from './components/AdminDashboard';
import IntrospectionPage from './components/IntrospectionPage';
import Botanica from './components/Botanica';
import BibleMaps from './components/BibleMaps';
import NavigationDock from './components/NavigationDock';
import ExitConfirmationModal from './components/ExitConfirmationModal';
import SongDetail from './components/SongDetail';
import FloatingActionStack from './components/FloatingActionStack'; // Unified Stack
import type { Page, User, UserProfile } from './types';
import Logo from './components/Logo';
import { subscribeToAuthChanges, loginUser, registerUser, logoutUser, syncUserProfile, loginWithGoogle, subscribeToAppVersion } from './services/firebaseService';
import { initializeNativeStyles, setupKeyboardListeners, setStatusBarStyle } from './services/nativeService';
import { updateMetadata } from './services/seoService';
import { checkAndSendDailyVerse } from './services/notificationService';
import DownloadIcon from './components/icons/DownloadIcon';

const App: React.FC = () => {
  // Initialize Page from URL if present
  const getInitialPage = (): Page => {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam && ['home', 'verse', 'bible', 'songs', 'song', 'events', 'about', 'admin', 'profile', 'plans', 'create', 'casestudies', 'introspection', 'botanica', 'video', 'maps'].includes(pageParam)) {
          return pageParam as Page;
      }
      return 'home';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  // Specific State for Detail Pages
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  
  // Initialize ID from URL if page is 'song'
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (currentPage === 'song') {
          const id = params.get('id');
          if (id) setSelectedSongId(id);
      }
  }, [currentPage]);

  // Enforce Dark Mode
  useEffect(() => {
      // Always add 'dark' class
      const root = window.document.documentElement;
      root.classList.add('dark');
      // Set native status bar to dark theme (light text)
      setStatusBarStyle('dark');
      // Clear any legacy local storage for theme to prevent confusion
      localStorage.removeItem('trueHarvestTheme');
  }, []);

  // Handle Browser Back/Forward Buttons
  useEffect(() => {
      const handlePopState = () => {
          if (showExitModal) {
              setShowExitModal(false);
              // Push state back so we don't actually navigate away if modal was just closed
              try {
                  window.history.pushState(null, '', window.location.pathname);
              } catch (e) {}
          } else {
              setCurrentPage(getInitialPage());
          }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, [showExitModal]);

  // Handle Native Android Back Button
  useEffect(() => {
      const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (showExitModal) {
              // If modal is open, back button acts as "Cancel"
              setShowExitModal(false);
          } else if (currentPage === 'song') {
              setCurrentPage('songs');
          } else if (currentPage !== 'home' && currentUser) {
              // If deep in the app, go back to home
              setCurrentPage('home');
          } else if (currentPage === 'home' || !currentUser) {
              // If on home (or login), trigger the exit flow
              setShowExitModal(true);
          } else {
              // Default behavior (though usually captured above)
              if(canGoBack) window.history.back();
          }
      });

      return () => {
          listener.then(handle => handle.remove());
      };
  }, [currentPage, showExitModal, currentUser]);

  // Initialize Native Features & Auth & Version Check
  useEffect(() => {
    initializeNativeStyles();
    setupKeyboardListeners();

    // Listen for version updates
    const initialTime = Date.now();
    const unsubVersion = subscribeToAppVersion((data) => {
        if (data && data.version > initialTime) {
            setUpdateAvailable(true);
        }
    });

    let isMounted = true;

    // Safety Timeout for Firebase loading
    const loadingTimer = setTimeout(() => {
        if (isMounted) {
            setIsSessionLoading(false);
        }
    }, 5000);

    const unsubscribe = subscribeToAuthChanges((user) => {
        if (!isMounted) return;
        setCurrentUser(user);
        setIsSessionLoading(false);
        clearTimeout(loadingTimer);
        if (user) {
            setShowWelcome(false);
            setIsGuestMode(false);
            
            // Check and send notification if enabled
            checkAndSendDailyVerse(user);
        }
    });

    return () => {
        isMounted = false;
        if (unsubscribe) unsubscribe();
        if (unsubVersion) unsubVersion();
        clearTimeout(loadingTimer);
    };
  }, []);

  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Sync URL with State (Basic routing for SPA SEO)
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') !== currentPage) {
        // Special case: BibleReader handles its own detailed URL params
        if (currentPage !== 'bible') {
            const newUrl = currentPage === 'home' ? '/' : `/?page=${currentPage}`;
            
            try {
                // If on song page, include encoded ID
                if (currentPage === 'song' && selectedSongId) {
                    const encodedId = encodeURIComponent(selectedSongId);
                    window.history.pushState(null, '', `/?page=song&id=${encodedId}`);
                } else {
                    window.history.pushState(null, '', newUrl);
                }
            } catch (e) {
                console.debug("Could not update history state (likely restricted environment)", e);
            }
        }
    }

    // Dynamic SEO Management
    switch (currentPage) {
        case 'home':
            updateMetadata(
                'Home', 
                'Welcome to True Harvest, a premium AI-powered digital sanctuary for the Christian community.', 
                '/',
                { "@type": "WebSite", "name": "True Harvest", "url": "https://trueharvest.world" }
            );
            break;
        case 'song':
             // Metadata will be updated inside SongDetail once loaded
             break;
        case 'bible':
            // Metadata is handled inside BibleReader component for specific chapters
            break; 
        default:
            updateMetadata(currentPage.charAt(0).toUpperCase() + currentPage.slice(1), 'True Harvest App', `/?page=${currentPage}`);
    }
  }, [currentPage, selectedSongId]);

  const handleLogin = async (email: string, password?: string): Promise<{ success: boolean; message: string }> => {
    if (!password) return { success: false, message: "Password required." };
    const result = await loginUser(email, password);
    if (result.success) {
        setCurrentPage('home');
    }
    return result;
  };

  const handleGoogleLogin = async (): Promise<{ success: boolean; message: string }> => {
      const result = await loginWithGoogle();
      if (result.success) {
          setCurrentPage('home');
      }
      return result;
  };

  const handleRegister = async (email: string, password?: string, rememberMe?: boolean, profileData?: Partial<UserProfile>): Promise<{ success: boolean; message: string }> => {
      if (!password) return { success: false, message: "Password required." };
      const result = await registerUser(email, password, profileData || {});
      if (result.success) {
          setCurrentPage('home');
      }
      return result;
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsGuestMode(false);
    setCurrentPage('home');
    setShowWelcome(true);
  };

  const handleGuestAccess = () => {
    setIsGuestMode(true);
    setCurrentPage('home');
  };

  const handleUpdateProfile = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      syncUserProfile(updatedUser); 
  };

  const handleSongSelect = (songId: string) => {
      setSelectedSongId(songId);
      setCurrentPage('song');
  };

  if (isSessionLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-950">
              <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                      <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                      <Logo svgClassName="w-16 h-16 text-amber-400 relative z-10" showText={false} />
                  </div>
                  <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
              </div>
          </div>
      );
  }

  if (!currentUser && !isGuestMode) {
      if (showWelcome) {
          return <WelcomePage onEnter={() => setShowWelcome(false)} />;
      }
      return (
        <LoginPage 
            onLogin={handleLogin} 
            onRegister={handleRegister}
            onGoogleLogin={handleGoogleLogin}
            onGuestAccess={handleGuestAccess}
            onBack={() => setShowWelcome(true)}
        />
    );
  }

  const canAccessFullContent = !!currentUser;
  const isUserAdmin = currentUser?.role === 'admin';

  // Helper to render restricted access message
  const renderRestrictedAccess = (title: string, message: string) => (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl animate-fadeIn max-w-2xl mx-auto mt-10">
           <div className="bg-slate-700/50 p-4 rounded-full mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
           </div>
           <h2 className="text-3xl font-bold text-white mb-2 font-serif">{title}</h2>
           <p className="text-slate-400 mb-6 text-center max-w-md px-4">
               {message}
           </p>
           <button 
              onClick={() => setCurrentPage('home')} 
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 rounded-lg text-slate-900 font-bold transition-colors"
          >
              Return Home
          </button>
       </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 flex flex-col relative overflow-x-hidden pb-32">
      
      {/* Background Layers - Permanently Dark */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-slate-950"></div>
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1475257026007-0753d5429e10?q=80&w=2670&auto=format&fit=crop')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/95 to-slate-950"></div>
        
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onOpenChat={() => {
            // Force open chat via event dispatch since state is in sibling
            // This is a quick fix to avoid massive refactoring of context
            window.dispatchEvent(new CustomEvent('open-junia-chat'));
        }}
      />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 animate-fadeIn relative z-10">
        {currentPage === 'home' && (
          <HomePage setCurrentPage={setCurrentPage} currentUser={currentUser} openChat={() => window.dispatchEvent(new CustomEvent('open-junia-chat'))} />
        )}
        {currentPage === 'verse' && (
          <VerseOfTheDayPage setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'bible' && (
          <BibleReader setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'about' && <AboutPage setCurrentPage={setCurrentPage} />}

        {canAccessFullContent ? (
            <>
                {currentPage === 'botanica' && <Botanica setCurrentPage={setCurrentPage} />}
                {currentPage === 'create' && <VerseImageGenerator setCurrentPage={setCurrentPage} />}
                
                {/* Admin Restricted Pages */}
                {currentPage === 'video' && (isUserAdmin ? <VideoGenerator /> : renderRestrictedAccess("Admin Access Only", "The Cinema video generation feature is currently in preview for administrators."))}
                
                {currentPage === 'maps' && <BibleMaps setCurrentPage={setCurrentPage} />}
                {currentPage === 'songs' && <SongLibrary setCurrentPage={setCurrentPage} onSongSelect={handleSongSelect} />}
                
                {currentPage === 'song' && selectedSongId && (
                    <SongDetail 
                        songId={selectedSongId} 
                        currentUser={currentUser}
                        onBack={() => setCurrentPage('songs')} 
                    />
                )}
                
                {currentPage === 'events' && (isUserAdmin ? <EventsCalendar setCurrentPage={setCurrentPage} /> : renderRestrictedAccess("Admin Access Only", "Event management is currently restricted to administrators."))}
                
                {currentPage === 'plans' && <BiblePlans setCurrentPage={setCurrentPage} />}
                {currentPage === 'casestudies' && <CaseStudies setCurrentPage={setCurrentPage} />}
                
                {currentPage === 'introspection' && <IntrospectionPage setCurrentPage={setCurrentPage} />}
                
                {currentPage === 'profile' && currentUser && (
                    <UserProfileComponent 
                            user={currentUser} 
                            onUpdateUser={handleUpdateProfile} 
                            setCurrentPage={setCurrentPage}
                    />
                )}

                {currentPage === 'admin' && isUserAdmin && (
                    <AdminDashboard 
                        setCurrentPage={setCurrentPage} 
                    />
                )}
            </>
        ) : (
            !['home', 'verse', 'bible', 'about', 'song'].includes(currentPage) && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl">
                     <div className="bg-slate-700/50 p-4 rounded-full mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                         </svg>
                     </div>
                     <h2 className="text-3xl font-bold text-white mb-2 font-serif">Member Exclusive</h2>
                     <p className="text-slate-400 mb-6 text-center max-w-md px-4">
                         Join the True Harvest community to access Songs, Events, Bible Study, Case Studies, and more.
                     </p>
                     <button 
                        onClick={() => handleLogout()} 
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 rounded-lg text-slate-900 font-bold transition-colors"
                    >
                        Create Account
                    </button>
                 </div>
            )
        )}
      </main>

      <NavigationDock currentPage={currentPage} setCurrentPage={setCurrentPage} currentUser={currentUser} />
      
      {/* GLOBAL FLOATING ACTION STACK (Flight, Doubts, Junia) */}
      {(currentUser || isGuestMode) && (
          <FloatingActionStack setCurrentPage={setCurrentPage} currentPage={currentPage} />
      )}

      <Footer setCurrentPage={setCurrentPage} />

      {/* Update Toast */}
      {updateAvailable && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-fadeInUp">
              <button 
                onClick={() => window.location.reload()}
                className="bg-amber-500 text-slate-900 px-6 py-3 rounded-full font-bold shadow-2xl flex items-center space-x-2 border-2 border-white hover:scale-105 transition-transform"
              >
                  <DownloadIcon className="h-5 w-5" />
                  <span>New Version Available. Click to Refresh.</span>
              </button>
          </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
          <ExitConfirmationModal 
              onCancel={() => setShowExitModal(false)}
              onConfirmExit={() => CapacitorApp.exitApp()}
          />
      )}
    </div>
  );
};

export default App;
