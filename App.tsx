
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

const STORAGE_PREFIX = 'chathub_v39_';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem(`${STORAGE_PREFIX}user`);
    const localH = localStorage.getItem(`${STORAGE_PREFIX}history`);
    const localW = localStorage.getItem(`${STORAGE_PREFIX}webhooks`);

    if (localH) { try { setHistory(JSON.parse(localH)); } catch(e){} }
    if (localW) { try { setSavedWebhooks(JSON.parse(localW)); } catch(e){} }

    if (localUser) {
      setUser(JSON.parse(localUser));
      setIsReady(true);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));
  }, [history, savedWebhooks, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    if (confirm('להתנתק מהמערכת?')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 relative overflow-hidden text-slate-900" dir="rtl">
      {/* Dynamic Background Orbs - Much more vibrant for v39 */}
      <div className="fixed -top-[5%] -left-[10%] w-[50%] h-[50%] bg-pink-200/40 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="fixed -bottom-[5%] -right-[10%] w-[50%] h-[50%] bg-cyan-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col gap-6">
        
        {/* Header - Crystal Glass */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 backdrop-blur-2xl p-4 px-8 rounded-[2.5rem] border border-white shadow-2xl shadow-indigo-100/50">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 rotate-6 group-hover:rotate-0 transition-all duration-500 border border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black italic tracking-tighter animated-gradient-text leading-none font-rubik">ChatHub</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">גרסת Dawn Aura • v39</span>
               </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-white shadow-inner">
              <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                   <span>משגר הודעות</span>
              </TabButton>
              <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                   <span>מחולל סקרים</span>
              </TabButton>
            </nav>
          </div>

          <div className="flex items-center gap-5">
             <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-50 text-[10px] font-black uppercase text-indigo-500 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                חיבור מקומי מאובטח
             </div>
             {user && (
               <div className="flex items-center gap-3 p-1 rounded-full bg-white border border-slate-100 shadow-xl shadow-indigo-100/50 pr-1 pl-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-black overflow-hidden border-2 border-white order-2 shadow-sm">
                     {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0]}
                  </div>
                  <div className="flex flex-col items-end leading-tight order-1">
                    <span className="text-sm font-bold text-slate-800 font-rubik">{user.username}</span>
                    <button onClick={handleLogout} className="text-[9px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest mt-0.5">התנתקות מהירה</button>
                  </div>
               </div>
             )}
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
          <main className="flex-1 min-h-0 flex flex-col">
            {activeApp === 'chatSender' ? (
              <GoogleChatSender 
                saveHistory={(p, url) => {
                    const webhook = savedWebhooks.find(w => w.url === url);
                    setHistory(prev => [{ timestamp: Date.now(), payload: p, webhookUrl: url, webhookName: webhook?.name }, ...prev]);
                }} 
                savedWebhooks={savedWebhooks}
                onAddWebhook={(w) => setSavedWebhooks(prev => [...prev, w])}
                onDeleteWebhook={(id) => setSavedWebhooks(prev => prev.filter(x => x.id !== id))}
              />
            ) : (
              <OtherApp 
                saveHistory={(p, url) => {
                    const webhook = savedWebhooks.find(w => w.url === url);
                    setHistory(prev => [{ timestamp: Date.now(), payload: p, webhookUrl: url, webhookName: webhook?.name }, ...prev]);
                }}
                savedWebhooks={savedWebhooks}
                onAddWebhook={(w) => setSavedWebhooks(prev => [...prev, w])}
                onDeleteWebhook={(id) => setSavedWebhooks(prev => prev.filter(x => x.id !== id))}
              />
            )}
          </main>

          <aside className="w-full lg:w-[420px] flex-shrink-0 flex flex-col min-h-0">
            <HistorySidebar 
              history={history} 
              syncStatus="success"
              username={user?.username}
              avatar={user?.avatar}
              savedWebhooks={savedWebhooks}
              cloudId={null}
              onLogout={handleLogout}
              onImportFile={() => {}} 
              onExportFile={() => {}} 
              onSetCloudId={() => {}}
              onResetCloud={() => {}}
              onManualSync={() => {}}
            />
          </aside>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
