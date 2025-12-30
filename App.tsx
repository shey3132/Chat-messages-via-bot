
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

const STORAGE_PREFIX = 'chathub_v42_';

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
    if (confirm('בטוח שברצונך להתנתק?')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-rose-200 relative overflow-hidden text-slate-900" dir="rtl">
      
      {/* Background Animated Orbs */}
      <div className="fixed -top-40 -left-40 w-[70%] h-[70%] bg-indigo-300/30 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="fixed -bottom-40 -right-40 w-[60%] h-[60%] bg-rose-300/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-3xl p-5 px-10 rounded-[3rem] border border-white shadow-2xl shadow-rose-200/40">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-6 group cursor-pointer">
               <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-rose-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-200 rotate-6 group-hover:rotate-0 transition-all duration-500 border border-white/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-black italic tracking-tighter animated-gradient-text leading-none font-rubik">ChatHub</span>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Premium Experience • v42</span>
               </div>
            </div>

            <nav className="hidden md:flex items-center gap-3 bg-slate-200/50 p-1.5 rounded-2xl border border-white/50">
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

          <div className="flex items-center gap-8">
             <div className="hidden lg:flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-rose-100 text-[11px] font-black uppercase text-indigo-600 shadow-sm backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(79,70,229,0.7)]" />
                חיבור ענן פעיל
             </div>
             {user && (
               <div className="flex items-center gap-4 p-1.5 rounded-full bg-white border border-rose-100 shadow-xl shadow-rose-200/50 pr-1 pl-6 group hover:shadow-rose-300 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-200 to-amber-100 flex items-center justify-center text-rose-600 font-black overflow-hidden border-2 border-white order-2 shadow-md group-hover:scale-110 transition-transform">
                     {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0]}
                  </div>
                  <div className="flex flex-col items-end leading-tight order-1">
                    {/* Fixed username with system font and high visibility */}
                    <span className="text-lg font-black text-slate-900 username-fix">{user.username}</span>
                    <button onClick={handleLogout} className="text-[11px] font-black text-rose-500 hover:text-red-600 transition-colors uppercase tracking-[0.2em] mt-1">התנתקות</button>
                  </div>
               </div>
             )}
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
          <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
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

          <aside className="w-full lg:w-[450px] flex-shrink-0 flex flex-col min-h-0">
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
