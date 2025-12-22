
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid namespace error in browser environment
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  // 1. טעינה ראשונית מ-LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('chathub_user');
    const storedHistory = localStorage.getItem('chatHistory');
    const storedWebhooks = localStorage.getItem('savedWebhooks');

    if (storedHistory) setHistory(JSON.parse(storedHistory));
    if (storedWebhooks) setSavedWebhooks(JSON.parse(storedWebhooks));
    if (savedUser) setUser(JSON.parse(savedUser));
    else setIsAuthOpen(true);
  }, []);

  // 2. פונקציית משיכה מהענן
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

        // מיזוג מידע - מניעת כפילויות
        if (cloudHistory.length > 0) {
          setHistory(prev => {
            const combined = [...prev, ...cloudHistory];
            return Array.from(new Map(combined.map(item => [item.timestamp, item])).values())
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 50);
          });
        }
        
        if (cloudWebhooks.length > 0) {
          setSavedWebhooks(prev => {
            const combined = [...prev, ...cloudWebhooks];
            return Array.from(new Map(combined.map(item => [item.id, item])).values());
          });
        }
        setSyncStatus('success');
      }
    } catch (e) {
      setSyncStatus('error');
    }
  }, []);

  // 3. פונקציית דחיפה לענן
  const pushToCloud = useCallback(async (key: string, data: UserDataContainer) => {
    if (!key) return;
    setSyncStatus('syncing');
    try {
      await fetch(`${SYNC_PROVIDER_URL}${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setSyncStatus('success');
    } catch (e) {
      setSyncStatus('error');
    }
  }, []);

  // 4. סנכרון אוטומטי בשינויים
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      if (user?.syncKey) pullFromCloud(user.syncKey);
      return;
    }

    if (user?.syncKey) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        pushToCloud(user.syncKey, { history, webhooks: savedWebhooks });
      }, 2000);
    }

    localStorage.setItem('chatHistory', JSON.stringify(history));
    localStorage.setItem('savedWebhooks', JSON.stringify(savedWebhooks));
  }, [history, savedWebhooks, user?.syncKey, pullFromCloud, pushToCloud]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem('chathub_user', JSON.stringify(newUser));
    setIsAuthOpen(false);
    pullFromCloud(syncKey);
  };

  const saveHistory = (payload: ChatMessagePayload) => {
    setHistory(prev => {
      const newItem: HistoryItem = { timestamp: Date.now(), payload };
      return [newItem, ...prev].slice(0, 50);
    });
  };

  const handleAddWebhook = (webhook: SavedWebhook) => {
    setSavedWebhooks(prev => [...prev, webhook]);
  };

  const handleDeleteWebhook = (id: string) => {
    setSavedWebhooks(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900" dir="rtl">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 h-screen flex flex-col gap-6">
        
        {/* Header / Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-sm">
          <div className="flex items-center gap-2 p-1">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>
              משגר הודעות
            </TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>
              מחולל סקרים
            </TabButton>
          </div>
          <div className="flex items-center gap-3 px-4">
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">מחובר כ-</p>
              <p className="text-sm font-bold text-slate-700">{user?.username || 'אורח'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          {/* Main App Area */}
          <main className="flex-1 min-h-0">
            {activeApp === 'chatSender' ? (
              <GoogleChatSender 
                saveHistory={saveHistory} 
                savedWebhooks={savedWebhooks}
                onAddWebhook={handleAddWebhook}
                onDeleteWebhook={handleDeleteWebhook}
              />
            ) : (
              <OtherApp 
                saveHistory={saveHistory}
                savedWebhooks={savedWebhooks}
                onAddWebhook={handleAddWebhook}
                onDeleteWebhook={handleDeleteWebhook}
              />
            )}
          </main>

          {/* Sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <HistorySidebar 
              history={history} 
              syncStatus={syncStatus}
              username={user?.username}
              avatar={user?.avatar}
            />
          </div>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
