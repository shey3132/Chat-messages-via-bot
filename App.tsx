
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
  
  // דגל קריטי: האם המערכת "מוכנה" לשלוח נתונים לענן?
  // זה הופך ל-true רק אחרי שסיימנו משיכה מוצלחת או שווידאנו שהענן ריק.
  const isReadyToPush = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. פונקציית משיכה מהענן - אופטימלית
  const pullFromCloud = useCallback(async (key: string) => {
    if (!key) return;
    setSyncStatus('syncing');
    
    try {
      const response = await fetch(`${SYNC_PROVIDER_URL}${key}`);
      
      if (response.status === 404) {
        console.log("Cloud is empty, starting fresh.");
        isReadyToPush.current = true;
        setSyncStatus('idle');
        return;
      }

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

        console.log(`Pulled ${cloudHistory.length} items from cloud.`);
        
        // עדכון סטייט מקומי
        setHistory(cloudHistory.slice(0, 50));
        setSavedWebhooks(cloudWebhooks);
        
        // רק אחרי שהסטייט עודכן, אנחנו מאשרים שליחה לענן
        setTimeout(() => {
          isReadyToPush.current = true;
          setSyncStatus('success');
        }, 500);
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      console.error("Failed to pull from cloud:", e);
      setSyncStatus('error');
    }
  }, []);

  // 2. פונקציית דחיפה לענן - עם הגנה
  const pushToCloud = useCallback(async (key: string, data: UserDataContainer) => {
    if (!key || !isReadyToPush.current) {
        console.log("Push blocked: system not ready or no key.");
        return;
    }
    
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${SYNC_PROVIDER_URL}${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setSyncStatus('success');
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      setSyncStatus('error');
    }
  }, []);

  // 3. טעינה ראשונית וניהול משתמש
  useEffect(() => {
    const savedUser = localStorage.getItem('chathub_user');
    const storedHistory = localStorage.getItem('chatHistory');
    const storedWebhooks = localStorage.getItem('savedWebhooks');

    if (storedHistory) setHistory(JSON.parse(storedHistory));
    if (storedWebhooks) setSavedWebhooks(JSON.parse(storedWebhooks));
    
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        pullFromCloud(parsedUser.syncKey);
    } else {
        setIsAuthOpen(true);
        isReadyToPush.current = true; // אם אין משתמש, אפשר להתחיל לסנכרן דף חלק
    }
  }, [pullFromCloud]);

  // 4. מאזין לשינויים בסטייט - מבצע דחיפה לענן (Debounced)
  useEffect(() => {
    if (!user || !isReadyToPush.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(() => {
      pushToCloud(user.syncKey, { history, webhooks: savedWebhooks });
    }, 2000);

    // תמיד שומרים גם ב-LocalStorage ליתר בטחון
    localStorage.setItem('chatHistory', JSON.stringify(history));
    localStorage.setItem('savedWebhooks', JSON.stringify(savedWebhooks));
  }, [history, savedWebhooks, user, pushToCloud]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    
    // איפוס לפני התחברות חדשה
    isReadyToPush.current = false; 
    setHistory([]);
    setSavedWebhooks([]);
    
    setUser(newUser);
    localStorage.setItem('chathub_user', JSON.stringify(newUser));
    setIsAuthOpen(false);
    
    // משיכת נתונים למשתמש החדש
    pullFromCloud(syncKey);
  };

  const handleLogout = () => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    isReadyToPush.current = false;
    setUser(null);
    setHistory([]);
    setSavedWebhooks([]);
    localStorage.clear();
    setIsAuthOpen(true);
  };

  const saveHistory = (payload: ChatMessagePayload, webhookUrl: string) => {
    const webhook = savedWebhooks.find(w => w.url === webhookUrl);
    setHistory(prev => {
      const newItem: HistoryItem = { 
          timestamp: Date.now(), 
          payload,
          webhookUrl,
          webhookName: webhook?.name
      };
      return [newItem, ...prev].slice(0, 50);
    });
  };

  const handleAddWebhook = (webhook: SavedWebhook) => {
    setSavedWebhooks(prev => {
      if (prev.find(w => w.url === webhook.url)) return prev;
      return [...prev, webhook];
    });
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

          <div className="w-full lg:w-96 flex-shrink-0">
            <HistorySidebar 
              history={history} 
              syncStatus={syncStatus}
              username={user?.username}
              avatar={user?.avatar}
              savedWebhooks={savedWebhooks}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
