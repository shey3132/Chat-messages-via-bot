
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

const STORAGE_PREFIX = 'chathub_v45_';

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
    <div className="min-h-screen relative overflow-hidden text-slate-900" dir="rtl">
      
      <div className="relative z-10 max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col gap-6">
        
        {/* Header - High Contrast Design */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/95 border-b-4 border-indigo-600 p-6 px-10 rounded-3xl shadow-xl">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               </div>
               <div className="flex flex-col">
                  <span className="text-4xl font-black italic tracking-tighter animated-gradient-text leading-none">ChatHub</span>
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mt-1">Version 45 • Ultra Visible</span>
               </div>
            </div>

            <nav className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
              <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>
                   <span className="font-black text-sm">משגר הודעות</span>
              </TabButton>
              <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>
                   <span className="font-black text-sm">מחולל סקרים</span>
              </TabButton>
            </nav>
          </div>

          <div className="flex items-center gap-6">
             {user && (
               <div className="flex items-center gap-4 p-2 pr-2 pl-6 rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-sm">
                  <div className="w-14 h-14 rounded-full border-4 border-white shadow-md overflow-hidden order-2">
                     {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{user.username[0]}</div>}
                  </div>
                  <div className="flex flex-col items-end order-1">
                    {/* Username fixed with math fonts and pure black */}
                    <span className="text-2xl font-black username-fix leading-none">{user.username}</span>
                    <button onClick={handleLogout} className="text-sm font-bold text-red-600 hover:underline mt-1">התנתקות</button>
                  </div>
               </div>
             )}
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
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
