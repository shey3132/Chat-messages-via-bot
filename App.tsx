
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

const STORAGE_PREFIX = 'chathub_v55_';
const CUSTOM_LOGO_URL = "https://raw.githubusercontent.com/shey3132/-22/refs/heads/main/shai-logo-animation%20(1).gif";

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string, isGuest?: boolean} | null>(null);
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

  const handleLogin = (username: string, syncKey: string, avatar?: string, isGuest: boolean = false) => {
    const newUser = { username, syncKey, avatar, isGuest };
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
    <div className="h-screen flex flex-col p-3 lg:p-5 gap-4 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Header - Custom Animated Logo */}
      <header className="flex flex-col sm:flex-row justify-between items-center header-gradient p-4 px-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 text-white">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 overflow-hidden">
                <img src={CUSTOM_LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">ChatHub</h1>
                <span className="text-[8px] font-bold opacity-70 tracking-widest uppercase mt-1">Workspace v55</span>
             </div>
          </div>

          <nav className="flex items-center gap-1 bg-black/10 p-1 rounded-2xl border border-white/10">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>
                 משגר הודעות
            </TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>
                 מחולל סקרים
            </TabButton>
          </nav>
        </div>

        <div className="flex items-center gap-4 mt-3 sm:mt-0">
           {user && (
             <div className="flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full bg-white shadow-xl">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-sm font-bold text-slate-900 username-display" dir="ltr">{user.username}</span>
                  <div className="flex gap-2 items-center mt-1">
                    {user.isGuest && <span className="text-[7px] font-black bg-indigo-600 text-white px-1.5 rounded-full tracking-tighter">GUEST</span>}
                    <button onClick={handleLogout} className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Logout</button>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden order-last bg-indigo-50 flex items-center justify-center shadow-inner">
                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-sm font-black text-indigo-400 uppercase">{user.username[0]}</span>}
                </div>
             </div>
           )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 animate-ready">
        <main className="flex-1 flex flex-col min-h-0">
          {activeApp === 'chatSender' ? (
            <GoogleChatSender 
              saveHistory={(p: any, url: string) => {
                  const webhook = savedWebhooks.find(w => w.url === url);
                  setHistory(prev => [{ timestamp: Date.now(), payload: p, webhookUrl: url, webhookName: webhook?.name }, ...prev]);
              }} 
              savedWebhooks={savedWebhooks}
              onAddWebhook={(w: SavedWebhook) => setSavedWebhooks(prev => [...prev, w])}
              onDeleteWebhook={(id: string) => setSavedWebhooks(prev => prev.filter(x => x.id !== id))}
            />
          ) : (
            <OtherApp 
              saveHistory={(p: any, url: string) => {
                  const webhook = savedWebhooks.find(w => w.url === url);
                  setHistory(prev => [{ timestamp: Date.now(), payload: p, webhookUrl: url, webhookName: webhook?.name }, ...prev]);
              }}
              savedWebhooks={savedWebhooks}
              onAddWebhook={(w: SavedWebhook) => setSavedWebhooks(prev => [...prev, w])}
              onDeleteWebhook={(id: string) => setSavedWebhooks(prev => prev.filter(x => x.id !== id))}
            />
          )}
        </main>

        <aside className="w-full lg:w-80 flex-shrink-0 min-h-0 flex flex-col">
          <HistorySidebar history={history} />
        </aside>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
