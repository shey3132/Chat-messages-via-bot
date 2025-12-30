
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

const STORAGE_PREFIX = 'chathub_v46_';

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
    if (confirm('להתנתק מהחשבון?')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 gap-6 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Header - Sleek & Compact */}
      <header className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-4 px-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <h1 className="text-xl font-black tracking-tight text-slate-900">ChatHub</h1>
          </div>

          <nav className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>
                 משגר הודעות
            </TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>
                 מחולל סקרים
            </TabButton>
          </nav>
        </div>

        <div className="flex items-center gap-4 mt-4 sm:mt-0">
           {user && (
             <div className="flex items-center gap-3 pl-4 pr-1 py-1 rounded-full bg-slate-50 border border-slate-200 group hover:bg-white transition-all cursor-default">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-sm username-display">{user.username}</span>
                  <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 hover:text-red-600 mt-1 uppercase">התנתק</button>
                </div>
                <div className="w-10 h-10 rounded-full border border-white shadow-sm overflow-hidden order-last">
                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-slate-200" />}
                </div>
             </div>
           )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <main className="flex-1 flex flex-col min-h-0">
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

        <aside className="w-full lg:w-80 flex-shrink-0 min-h-0 flex flex-col">
          <HistorySidebar history={history} />
        </aside>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
