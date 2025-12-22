
import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

const SYNC_PROVIDER_URL = 'https://kvdb.io/6E3tYfN1Yx6878YpXy6L5z/'; 

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');

  // טעינה ראשונית מ-LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('chathub_user');
    const storedHistory = localStorage.getItem('chatHistory');
    const storedWebhooks = localStorage.getItem('savedWebhooks');

    if (storedHistory) setHistory(JSON.parse(storedHistory));
    if (storedWebhooks) setSavedWebhooks(JSON.parse(storedWebhooks));
    if (savedUser) setUser(JSON.parse(savedUser));
    else setIsAuthOpen(true);
  }, []);

  // סנכרון אוטומטי ל-LocalStorage בכל שינוי
  useEffect(() => {
    if (history.length > 0) localStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (savedWebhooks.length > 0) localStorage.setItem('savedWebhooks', JSON.stringify(savedWebhooks));
  }, [savedWebhooks]);

  const pushToCloud = useCallback(async (key: string, data: UserDataContainer) => {
    if (!key) return;
    try {
      await fetch(`${SYNC_PROVIDER_URL}${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('Cloud sync failed:', err);
    }
  }, []);

  const pullFromCloud = useCallback(async (key: string) => {
    if (!key) return;
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${SYNC_PROVIDER_URL}${key}`);
      if (response.ok) {
        const remoteData = await response.json();
        let cloudHistory: HistoryItem[] = [];
        let cloudWebhooks: SavedWebhook[] = [];

        if (Array.isArray(remoteData)) {
          cloudHistory = remoteData;
        } else if (remoteData && typeof remoteData === 'object') {
          cloudHistory = remoteData.history || [];
          cloudWebhooks = remoteData.webhooks || [];
        }

        if (cloudHistory.length > 0 || cloudWebhooks.length > 0) {
          setHistory(prev => {
            const combined = [...prev, ...cloudHistory];
            return Array.from(new Map(combined.map(item => [item.timestamp, item])).values())
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 50);
          });

          setSavedWebhooks(prev => {
            const combined = [...prev, ...cloudWebhooks];
            return Array.from(new Map(combined.map(item => [item.url, item])).values());
          });
        }
        setSyncStatus('success');
      } else {
        setSyncStatus('idle');
      }
    } catch (err) {
      setSyncStatus('error');
    }
  }, []);

  // משיכה מהענן ברגע שהמשתמש מזוהה
  useEffect(() => {
    if (user?.syncKey) pullFromCloud(user.syncKey);
  }, [user?.syncKey, pullFromCloud]);

  const saveHistory = useCallback((payloadToSave: ChatMessagePayload) => {
    setHistory(prev => {
      const newItem: HistoryItem = { timestamp: Date.now(), payload: payloadToSave };
      const updated = [newItem, ...prev].slice(0, 50);
      if (user?.syncKey) pushToCloud(user.syncKey, { history: updated, webhooks: savedWebhooks });
      return updated;
    });
  }, [user, savedWebhooks, pushToCloud]);

  const addWebhook = useCallback((webhook: SavedWebhook) => {
    setSavedWebhooks(prev => {
        const updated = [webhook, ...prev.filter(w => w.url !== webhook.url)];
        if (user?.syncKey) pushToCloud(user.syncKey, { history, webhooks: updated });
        return updated;
    });
  }, [user, history, pushToCloud]);

  const deleteWebhook = useCallback((id: string) => {
    setSavedWebhooks(prev => {
        const updated = prev.filter(w => w.id !== id);
        if (user?.syncKey) pushToCloud(user.syncKey, { history, webhooks: updated });
        return updated;
    });
  }, [user, history, pushToCloud]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const userData = { username, syncKey, avatar };
    setUser(userData);
    localStorage.setItem('chathub_user', JSON.stringify(userData));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    if(confirm('בטוח שברצונך להתנתק?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-10 box-border bg-[#f8fafc] font-sans">
      <Analytics />
      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      
      <header className="w-full max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          
          <div className="flex items-center gap-5">
             <div className="p-2.5 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-100">
               <img src="https://raw.githubusercontent.com/shey3132/-22/main/%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%20%D7%93%D7%99%D7%92%D7%99%D7%98%D7%9C%D7%99%20%D7%A2%D7%9D%20%D7%A8%D7%A9%D7%AA%20%D7%A4%D7%A2%D7%95%D7%9C%D7%94.png" alt="Logo" className="w-10 h-10 object-contain brightness-0 invert" />
             </div>
             <div>
               <h1 className="text-3xl font-black text-slate-900 leading-none tracking-tight">ChatHub</h1>
               <p className="text-[10px] font-black text-indigo-500 mt-1.5 uppercase tracking-widest">Ultimate Message Hub</p>
             </div>
          </div>

          <nav className="flex items-center justify-center p-1.5 bg-slate-100/80 backdrop-blur rounded-[1.5rem] border border-slate-200/50">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>🚀 הודעות</TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>📊 סקרים</TabButton>
          </nav>

          <div className="flex items-center gap-4">
             {user && (
               <div className="flex items-center gap-3 bg-slate-50 pl-4 py-1.5 pr-1.5 rounded-full border border-slate-100 shadow-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-extrabold text-slate-800 leading-none">{user.username}</span>
                    <span className="text-[9px] text-green-500 font-bold mt-0.5">מחובר</span>
                  </div>
                  {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Profile" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button onClick={handleLogout} className="mr-2 text-slate-300 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                  </button>
               </div>
             )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
        <div className="lg:col-span-8">
            {activeApp === 'chatSender' && (
                <GoogleChatSender 
                    saveHistory={saveHistory} 
                    savedWebhooks={savedWebhooks}
                    onAddWebhook={addWebhook}
                    onDeleteWebhook={deleteWebhook}
                />
            )}
            {activeApp === 'otherApp' && (
                <OtherApp 
                    saveHistory={saveHistory} 
                    savedWebhooks={savedWebhooks}
                    onAddWebhook={addWebhook}
                    onDeleteWebhook={deleteWebhook}
                />
            )}
        </div>
        <div className="lg:col-span-4">
          <HistorySidebar 
            history={history} 
            syncStatus={syncStatus}
            username={user?.username}
            avatar={user?.avatar}
          />
        </div>
      </main>
    </div>
  );
}
