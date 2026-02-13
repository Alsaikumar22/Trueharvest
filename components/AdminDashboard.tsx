
import React, { useState, useEffect, useRef } from 'react';
import type { User, Page, BibleLanguage, Verse, EnglishVersion, Song } from '../types';
import { BIBLE_METADATA } from '../services/constants';
import { saveChapterLocally } from '../services/bibleService';
import { 
    bulkSaveChaptersToFirestore, 
    getAllUsers, 
    addSongToFirestore, 
    updateSongInFirestore,
    fetchSongsFromFirestore, 
    deleteSongFromFirestore,
    updateUserRole,
    deleteUserDoc,
    getFirebaseConfig, 
    db 
} from '../services/firebaseService';
import UserIcon from './icons/UserIcon';
import HomeIcon from './icons/HomeIcon';
import BibleIcon from './icons/BibleIcon';
import UploadIcon from './icons/UploadIcon';
import MusicIcon from './icons/MusicIcon';
import InfoIcon from './icons/InfoIcon';
import XIcon from './icons/XIcon';
import CheckIcon from './icons/CheckIcon';
import ImageEditIcon from './icons/ImageEditIcon';

const AdminDashboard: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'bible' | 'songs' | 'assets'>('users');
  
  // Bible DB States
  const [bibleLang, setBibleLang] = useState<BibleLanguage>('english');
  const [bibleVersion, setBibleVersion] = useState<EnglishVersion>('KJV');
  const [isUploading, setIsUploading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  
  // Manual Book Upload State
  const [manualBook, setManualBook] = useState('Genesis');
  const [manualContent, setManualContent] = useState('');
  
  // Mapping State (parsed from .h files)
  const [customBookMapping, setCustomBookMapping] = useState<Record<string, string>>({});

  // User Management
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Song Management
  const [songForm, setSongForm] = useState<Partial<Song>>({
      language: 'English',
      category: 'Praise & Worship',
      year: new Date().getFullYear(),
      theme: 'Worship',
      summary: 'A song of praise.',
      background: 'Created for True Harvest',
      lyrics: '',
      englishLyrics: ''
  });
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [isSavingSong, setIsSavingSong] = useState(false);
  const [storedSongs, setStoredSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'songs') fetchSongs(); }, [activeTab]);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [syncLogs]);

  // --- User Management Functions ---
  const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
          const users = await getAllUsers();
          setUserList(users);
      } catch (e) {
          console.error("Failed to load users", e);
      } finally {
          setIsLoadingUsers(false);
      }
  };

  const handleToggleUserRole = async (user: User) => {
      if (!user.email) {
          alert("User record is missing email address.");
          return;
      }
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const confirmMsg = `Are you sure you want to change ${user.email}'s role to ${newRole.toUpperCase()}?`;
      
      if (window.confirm(confirmMsg)) {
          try {
              await updateUserRole(user.email, newRole);
              // Update local state immediately
              setUserList(prev => prev.map(u => u.email === user.email ? { ...u, role: newRole } : u));
              alert(`Successfully updated role for ${user.email}`);
          } catch (e: any) {
              console.error(e);
              alert("Error updating role: " + e.message);
          }
      }
  };

  const handleDeleteUser = async (user: User) => {
      if (!user.email) return;
      if (user.email === 'trueharverst@gmail.com') {
          alert("Cannot delete the master admin.");
          return;
      }
      if (window.confirm(`Are you sure you want to delete user ${user.email}? This will remove their profile data.`)) {
          try {
              await deleteUserDoc(user.email);
              setUserList(prev => prev.filter(u => u.email !== user.email));
              alert("User deleted successfully.");
          } catch (e: any) {
              console.error(e);
              alert("Error deleting user: " + e.message);
          }
      }
  };

  // --- Song Management Functions ---
  const fetchSongs = async () => {
      setIsLoadingSongs(true);
      try {
          const songs = await fetchSongsFromFirestore();
          setStoredSongs(songs);
      } catch (e) {
          console.error("Failed to load songs for admin list", e);
      } finally {
          setIsLoadingSongs(false);
      }
  };

  const handleSongChange = (field: keyof Song, value: any) => {
      setSongForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStartEditSong = (song: Song) => {
      setSongForm({ ...song });
      setEditingSongId(song.id || null);
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingSongId(null);
      setSongForm({
          language: 'English',
          category: 'Praise & Worship',
          year: new Date().getFullYear(),
          theme: 'Worship',
          summary: 'A song of praise.',
          background: 'Created for True Harvest',
          lyrics: '',
          englishLyrics: ''
      });
  };

  const handleDeleteSong = async (song: Song) => {
      if(window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
          try {
              await deleteSongFromFirestore(song);
              fetchSongs(); // Refresh list
          } catch(e: any) {
              alert("Error deleting song: " + e.message);
          }
      }
  };

  const submitSong = async () => {
      if (!songForm.title || !songForm.artist || !songForm.lyrics) {
          alert("Please fill in Title, Artist, and Lyrics.");
          return;
      }
      setIsSavingSong(true);
      try {
          // Fill default image if missing
          const songPayload = {
              ...songForm,
              imageUrl: songForm.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop'
          } as Song;
          
          if (editingSongId) {
              // Update existing
              await updateSongInFirestore(songPayload);
              alert("Song updated successfully!");
              handleCancelEdit(); // Reset form
          } else {
              // Create new
              await addSongToFirestore(songPayload);
              alert("Song added successfully!");
              handleCancelEdit(); // Reset form
          }
          
          // Refresh list
          fetchSongs();
      } catch (e: any) {
          alert(`Error ${editingSongId ? 'updating' : 'saving'} song: ` + e.message);
      } finally {
          setIsSavingSong(false);
      }
  };

  // --- Bible Upload Logic (Existing) ---
  const parseHeaderFile = (content: string) => {
    const mapping: Record<string, string> = {};
    setSyncLogs(prev => [...prev, "Analyzing Header (.h) source..."]);

    const quotedRegex = /["']([^"']+)["']/g;
    const matches = [...content.matchAll(quotedRegex)];
    
    if (matches.length >= 66) {
        setSyncLogs(prev => [...prev, `Detected Array-style list with ${matches.length} names.`]);
        matches.forEach((m, idx) => {
            mapping[(idx + 1).toString()] = m[1].trim();
            mapping[idx.toString()] = m[1].trim(); 
        });
    } else {
        const defineRegex = /#define\s+([A-Z0-9_]+)\s+["']?([^"'\s;]+)["']?/gi;
        let match;
        while ((match = defineRegex.exec(content)) !== null) {
            mapping[match[2]] = match[1];
        }
    }

    const count = Object.keys(mapping).length;
    if (count > 0) {
        setCustomBookMapping(mapping);
        setSyncLogs(prev => [...prev, `✅ Success: Registered mappings for books.`]);
    } else {
        setSyncLogs(prev => [...prev, "❌ Failed: No valid book patterns found in file."]);
    }
  };

  const getBookNameFromId = (id: string) => {
      let mappedName = id;

      if (customBookMapping[id]) {
          mappedName = customBookMapping[id];
      }

      const meta = BIBLE_METADATA.find(bm => 
          bm.en.toLowerCase() === mappedName.toLowerCase() || 
          bm.hi?.toLowerCase() === mappedName.toLowerCase() ||
          bm.te?.toLowerCase() === mappedName.toLowerCase() ||
          bm.ta?.toLowerCase() === mappedName.toLowerCase() ||
          mappedName.toUpperCase().includes(bm.en.toUpperCase().substring(0,3))
      );

      if (meta) return meta.en;

      const numId = parseInt(id);
      if (!isNaN(numId)) {
          if (numId >= 1 && numId <= BIBLE_METADATA.length) return BIBLE_METADATA[numId - 1].en;
          if (numId >= 0 && numId < BIBLE_METADATA.length) return BIBLE_METADATA[numId].en;
      }
      
      return mappedName;
  };

  const parseXML = (xmlString: string) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const result: Record<string, Record<string, Verse>> = {};

      const bookTags = xmlDoc.querySelectorAll("book, Book, b, B, pk, PK");
      if (bookTags.length === 0) throw new Error("No <book> tags found in XML. (Case-sensitive check failed)");

      bookTags.forEach((bookNode) => {
          const bId = bookNode.getAttribute("id") || bookNode.getAttribute("n") || bookNode.getAttribute("code") || bookNode.getAttribute("pk") || "";
          const bName = getBookNameFromId(bId);
          result[bName] = {};

          const chapterTags = bookNode.querySelectorAll("chapter, Chapter, c, C");
          chapterTags.forEach((chNode) => {
              const chNum = chNode.getAttribute("id") || chNode.getAttribute("number") || chNode.getAttribute("n") || "1";
              result[bName][chNum] = {};

              const verseTags = chNode.querySelectorAll("verse, Verse, v, V, vs, VS");
              verseTags.forEach((vNode) => {
                  const vNum = vNode.getAttribute("id") || vNode.getAttribute("number") || vNode.getAttribute("n");
                  if (vNum) result[bName][chNum][parseInt(vNum)] = vNode.textContent || "";
              });
          });
      });
      return result;
  };

  const lightningSync = async (data: any) => {
      setIsUploading(true);
      setSyncLogs(prev => [...prev, "⚡ SYNC ENGINE INITIALIZING (Throttled Strategy)..."]);
      
      const tasks: { lang: string, version: string, book: string, chapter: number, verses: Verse }[] = [];
      const currentVersion = bibleLang === 'english' ? bibleVersion : 'BSI';

      Object.entries(data).forEach(([bName, chapters]: [string, any]) => {
          Object.entries(chapters).forEach(([chNum, verses]: [string, any]) => {
              tasks.push({ 
                  lang: bibleLang, 
                  version: currentVersion, 
                  book: bName, 
                  chapter: parseInt(chNum), 
                  verses 
              });
          });
      });

      if (tasks.length === 0) {
           setSyncLogs(prev => [...prev, "⚠️ No content extracted from XML. Check tag structure."]);
           setIsUploading(false);
           return;
      }

      setSyncLogs(prev => [...prev, `Extracted ${tasks.length} chapters. Preparing to sync...`]);
      
      if(tasks.length > 0) {
          const sample = tasks[0];
          const sampleId = `${sample.lang.toLowerCase()}_${sample.version}_${sample.book.replace(/\s+/g, "_")}_${sample.chapter}`;
          setSyncLogs(prev => [...prev, `ℹ️ ID Preview (1st item): ${sampleId}`]);
      }

      try {
          const success = await bulkSaveChaptersToFirestore(tasks);
          if (success) {
            setSyncLogs(prev => [...prev, `✅ CLOUD SYNC COMPLETE (${tasks.length} items).`]);
            setSyncLogs(prev => [...prev, "Refreshing Local Cache..."]);
            await Promise.all(tasks.map(t => saveChapterLocally(t.lang as any, t.version, t.book, t.chapter, t.verses)));
            setSyncLogs(prev => [...prev, "✨ SYSTEM READY."]);
          } else {
            throw new Error("Bulk save was interrupted to prevent write stream exhaustion.");
          }
      } catch (err: any) {
          setSyncLogs(prev => [...prev, `❌ ERROR: ${err.message || 'Transaction failed.'}`]);
      } finally {
          setIsUploading(false);
      }
  };

  const handleManualBookUpload = async () => {
      if (!manualContent.trim()) {
          alert("Please paste valid JSON content.");
          return;
      }
      
      setIsUploading(true);
      setSyncLogs(prev => [...prev, `⚡ Starting Manual Sync for ${manualBook} (${bibleLang})...`]);

      try {
          const chaptersData = JSON.parse(manualContent);
          const tasks: any[] = [];
          const currentVersion = bibleLang === 'english' ? bibleVersion : 'BSI';

          Object.entries(chaptersData).forEach(([chNum, verses]) => {
              if (typeof verses === 'object') {
                  tasks.push({
                      lang: bibleLang,
                      version: currentVersion,
                      book: manualBook,
                      chapter: parseInt(chNum),
                      verses
                  });
              }
          });

          if (tasks.length === 0) {
              throw new Error("No valid chapters found in JSON.");
          }

          await bulkSaveChaptersToFirestore(tasks);
          setSyncLogs(prev => [...prev, `✅ SUCCESS: Uploaded ${manualBook}.`]);
          setManualContent('');
      } catch (e: any) {
          setSyncLogs(prev => [...prev, `❌ ERROR: ${e.message}`]);
          alert("Upload failed. Check logs.");
      } finally {
          setIsUploading(false);
      }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, expectedExt: string) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== expectedExt) {
          alert(`File mismatch. Please upload a .${expectedExt} file.`);
          return;
      }

      e.target.value = ''; // Reset input to allow re-upload

      const reader = new FileReader();
      reader.onload = async (event) => {
          const raw = event.target?.result as string;
          if (ext === 'h') parseHeaderFile(raw);
          else if (ext === 'xml') {
              try {
                  const parsed = parseXML(raw);
                  await lightningSync(parsed);
              } catch (err: any) {
                  setSyncLogs(prev => [...prev, `❌ XML Error: ${err.message}`]);
              }
          }
          else if (ext === 'json') await lightningSync(JSON.parse(raw));
      };
      reader.readAsText(file);
  };

  const deployNewVersion = async () => {
      const confirmed = window.confirm("Are you sure you want to trigger a system-wide update? This will notify all active users to reload the app.");
      if (!confirmed) return;

      try {
          await db.collection('system_settings').doc('app_version').set({
              version: Date.now(),
              message: "A new version of True Harvest is available.",
              deployedBy: "Admin"
          });
          alert("Update Signal Deployed! Active users will be notified shortly.");
      } catch (e) {
          console.error("Deploy failed", e);
          alert("Failed to deploy signal.");
      }
  };

  const fbConfig = getFirebaseConfig();

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-10 max-w-6xl mx-auto relative overflow-hidden animate-fadeInUp">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400"><UserIcon className="h-8 w-8" /></div>
          <div className="ml-5"><h1 className="text-3xl font-serif font-bold text-white tracking-tight">Admin Portal</h1></div>
        </div>
        <button onClick={() => setCurrentPage('home')} className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">
            <HomeIcon className="h-5 w-5" /><span>Home</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-8 border-b border-slate-700 overflow-x-auto custom-scrollbar">
          {['users', 'bible', 'songs', 'assets'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 px-6 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300'}`}>{tab}</button>
          ))}
      </div>

      {activeTab === 'assets' && (
          <div className="animate-fadeIn space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                  {/* Deployment Control */}
                  <div className="bg-slate-800/40 p-8 rounded-3xl border border-amber-500/30 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center">
                          <span className="p-2 bg-amber-500/10 rounded-lg mr-3 text-amber-500">🚀</span>
                          System Deployment
                      </h3>
                      <p className="text-slate-400 text-sm mb-6">
                          Push a signal to all connected clients to reload the application. Use this after you have uploaded new content or fixed bugs.
                      </p>
                      <button 
                          onClick={deployNewVersion}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
                      >
                          <UploadIcon className="h-5 w-5" />
                          Deploy New Version
                      </button>
                  </div>

                  {/* Config Info */}
                  <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-serif font-bold text-white flex items-center">
                              <InfoIcon className="h-6 w-6 text-blue-500 mr-3" />
                              Cloud Configuration
                          </h3>
                          <div className="flex items-center px-4 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Active</span>
                          </div>
                      </div>
                      <div className="space-y-2">
                          {Object.entries(fbConfig).slice(0, 3).map(([key, val]) => (
                              <div key={key} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex justify-between">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                                  <code className="text-xs text-blue-200 truncate max-w-[150px]">{String(val)}</code>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50">
                  <h3 className="text-xl font-serif font-bold text-white mb-6">Database Health & Maintenance</h3>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                          <div>
                              <h4 className="font-bold text-white mb-1">Local Bible Cache</h4>
                              <p className="text-sm text-slate-500">Purge data stored in IndexedDB/LocalStorage. Useful after major cloud updates.</p>
                          </div>
                          <button 
                              onClick={() => {
                                  localStorage.removeItem('trueHarvestBibleFetchedCache');
                                  alert("Local Bible cache cleared. Next read will pull from Cloud.");
                              }}
                              className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-all"
                          >
                              Clear Cache
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'bible' && (
          <div className="animate-fadeIn grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                      <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-[10px] opacity-60">Target Language</h3>
                      <div className="grid grid-cols-2 gap-3">
                          {['english', 'telugu', 'tamil', 'hindi', 'kannada', 'malayalam'].map(lang => (
                              <button key={lang} onClick={() => setBibleLang(lang as any)} className={`p-3 rounded-xl border text-sm font-bold uppercase transition-all ${bibleLang === lang ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>{lang}</button>
                          ))}
                      </div>
                  </div>

                  {bibleLang === 'english' && (
                      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-[10px] opacity-60">English Version</h3>
                          <div className="grid grid-cols-3 gap-2">
                              {['KJV', 'NKJV', 'ESV', 'NIV', 'NLT', 'NASB', 'AMP'].map(ver => (
                                  <button key={ver} onClick={() => setBibleVersion(ver as any)} className={`py-2 rounded-lg border text-xs font-bold transition-all ${bibleVersion === ver ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{ver}</button>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                      <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-[10px] opacity-60">Upload Source</h3>
                      <div className="space-y-4">
                          <div className="relative group">
                              <input type="file" accept=".h" onChange={(e) => handleFile(e, 'h')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
                              <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-xl bg-slate-900/50 group-hover:border-amber-500/50 transition-all">
                                  <span className="text-sm font-bold text-slate-400 group-hover:text-amber-400">1. Upload Header Map (.h)</span>
                              </div>
                          </div>
                          <div className="relative group">
                              <input type="file" accept=".xml" onChange={(e) => handleFile(e, 'xml')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
                              <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-xl bg-slate-900/50 group-hover:border-green-500/50 transition-all">
                                  {isUploading ? <div className="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full"></div> : <div className="text-center"><UploadIcon className="h-8 w-8 mx-auto text-slate-500 mb-2" /><span className="text-sm font-bold text-slate-300">2. Upload Bible Content (.xml)</span></div>}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Manual Book Upload Section */}
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-[10px] opacity-60">Single Book Upload (JSON)</h3>
                        <div className="space-y-4">
                            <select 
                                value={manualBook} 
                                onChange={(e) => setManualBook(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                            >
                                {BIBLE_METADATA.map(b => (
                                    <option key={b.en} value={b.en}>{b.en}</option>
                                ))}
                            </select>
                            <textarea 
                                value={manualContent}
                                onChange={(e) => setManualContent(e.target.value)}
                                placeholder='Paste JSON: { "1": { "1": "Verse text" } }'
                                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-amber-500 outline-none resize-none"
                            />
                            <button 
                                onClick={handleManualBookUpload}
                                disabled={isUploading || !manualContent}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : 'Sync Book'}
                            </button>
                        </div>
                  </div>
              </div>

              <div className="lg:col-span-7">
                  <div className="bg-black/40 rounded-2xl border border-slate-800 p-4 h-[600px] flex flex-col font-mono text-xs">
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                          <span className="text-slate-500 uppercase font-bold">System Log</span>
                          <button onClick={() => setSyncLogs([])} className="text-slate-600 hover:text-red-400">Clear</button>
                      </div>
                      <div className="flex-grow overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                          {syncLogs.length === 0 && <span className="text-slate-700 italic">Ready for input...</span>}
                          {syncLogs.map((log, i) => (
                              <div key={i} className={`p-2 rounded ${log.includes('ERROR') || log.includes('Failed') ? 'bg-red-900/20 text-red-300' : log.includes('Success') || log.includes('COMPLETE') ? 'bg-green-900/20 text-green-300' : 'text-slate-400'}`}>{log}</div>
                          ))}
                          <div ref={logEndRef} />
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'users' && (
          <div className="animate-fadeIn">
              <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-slate-900/50 text-xs uppercase tracking-widest text-slate-500 border-b border-slate-700">
                              <th className="p-4">User</th>
                              <th className="p-4">Role</th>
                              <th className="p-4">Stats</th>
                              <th className="p-4">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm text-slate-300">
                          {isLoadingUsers ? <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr> : userList.map(u => (
                              <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                  <td className="p-4"><div className="font-bold text-white">{u.profile?.displayName || 'Unknown'}</div><div className="text-xs text-slate-500">{u.email}</div></td>
                                  <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>{u.role}</span></td>
                                  <td className="p-4"><div className="flex space-x-3 text-xs"><span className="text-blue-400">{u.profile?.versesRead || 0} Verses</span><span className="text-green-400">{u.profile?.streak || 0} Day Streak</span></div></td>
                                  <td className="p-4 flex gap-2">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleUserRole(u); }}
                                        className="text-xs bg-slate-700 hover:bg-blue-600 hover:text-white px-2 py-1 rounded transition-colors"
                                      >
                                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(u); }}
                                        className="text-xs bg-slate-700 hover:bg-red-600 hover:text-white px-2 py-1 rounded transition-colors"
                                      >
                                          Delete
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'songs' && (
          <div className="animate-fadeIn space-y-8">
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white flex items-center">
                          <MusicIcon className="h-5 w-5 mr-2 text-amber-500" /> 
                          {editingSongId ? 'Edit Song' : 'Add New Song'}
                      </h3>
                      {editingSongId && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} 
                            className="text-xs text-slate-400 hover:text-white bg-slate-700 px-3 py-1 rounded-lg"
                          >
                              Cancel Edit
                          </button>
                      )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <input type="text" placeholder="Song Title" value={songForm.title || ''} onChange={e => handleSongChange('title', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                          <input type="text" placeholder="Artist" value={songForm.artist || ''} onChange={e => handleSongChange('artist', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                          <div className="grid grid-cols-2 gap-4">
                              <select value={songForm.language} onChange={e => handleSongChange('language', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white">
                                  {['English', 'Telugu', 'Tamil', 'Hindi'].map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                              <input type="text" placeholder="YouTube URL" value={songForm.youtubeUrl || ''} onChange={e => handleSongChange('youtubeUrl', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                          </div>
                      </div>
                      <div className="space-y-4">
                          <textarea placeholder="Lyrics (Native Language)" value={songForm.lyrics || ''} onChange={e => handleSongChange('lyrics', e.target.value)} className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none resize-none" />
                          <textarea placeholder="English Transliteration/Translation (Optional)" value={songForm.englishLyrics || ''} onChange={e => handleSongChange('englishLyrics', e.target.value)} className="w-full h-20 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none resize-none" />
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                      <button onClick={(e) => { e.stopPropagation(); submitSong(); }} disabled={isSavingSong} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50">
                          {isSavingSong ? 'Saving...' : (editingSongId ? 'Update Song' : 'Add Song to Library')}
                      </button>
                  </div>
              </div>

              <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
                  <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Current Library ({storedSongs.length})</h3>
                      <button onClick={(e) => { e.stopPropagation(); fetchSongs(); }} className="text-xs text-blue-400 hover:text-blue-300">Refresh</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {isLoadingSongs ? <div className="p-8 text-center text-slate-500">Loading...</div> : storedSongs.map(song => (
                          <div key={song.id || song.title} className="p-4 border-b border-slate-700/50 flex justify-between items-center hover:bg-slate-800/30 transition-colors group">
                              <div>
                                  <div className="font-bold text-white">{song.title}</div>
                                  <div className="text-xs text-slate-500">{song.artist} • {song.language}</div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleStartEditSong(song); }} 
                                    className="text-slate-600 hover:text-blue-400 p-2 bg-slate-800/50 rounded-full"
                                    title="Edit"
                                  >
                                      <ImageEditIcon className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSong(song); }} 
                                    className="text-slate-600 hover:text-red-500 p-2 bg-slate-800/50 rounded-full"
                                    title="Delete"
                                  >
                                      <XIcon className="h-4 w-4" />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
