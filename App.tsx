
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

// מזהה ה-Bucket של ה-KV - שינוי גרסה לבידוד תקלות עבר
const SYNC_PROVIDER_URL = 'https://kvdb.io/6E3tYfN1Yx6878YpXy6L5z/'; 

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  
  // --- מנגנון נעילה קריטי ---
  const isInitialized = useRef(false); // האם סיימנו Pull מוצלח?
  const isPulling = useRef(false);    // האם אנחנו כרגע בתהליך Pull?
  const lastCloudHash = useRef("");   // חתימה של המידע האחרון שהגיע מהענן

  // 1. פונקציית משיכה מהענן
  const pullFromCloud = useCallback(async (key: string) => {
    if (!key || isPulling.current) return;
    
    isPulling.current = true;
    setSyncStatus('syncing');
    console.log("CloudSync: Starting pull...");

    try {
      const response = await fetch(`${SYNC_PROVIDER_URL}${key}?t=${Date.now()}`, { cache: 'no-store' });
      
      if (response.status === 404) {
        console.log("CloudSync: Remote is empty. Initializing new storage.");
        isInitialized.current = true;
        setSyncStatus('success');
      } else if (response.ok) {
        const remoteData: UserDataContainer = await response.json();
        const h = remoteData.history || [];
        const w = remoteData.webhooks || [];
        
        console.log(`CloudSync: Pulled ${h.length} history items and ${w.length} webhooks.`);
        
        // עדכון סטייט
        setHistory(h);
        setSavedWebhooks(w);
        
        // חתימה למניעת לופים
        lastCloudHash.current = JSON.stringify({ history: h, webhooks: w });
        
        // סימון שהמערכת מוכנה לסנכרן החוצה
        setTimeout(() => {
          isInitialized.current = true;
          setSyncStatus('success');
        }, 500);
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      console.error("CloudSync: Pull failed", e);
      setSyncStatus('error');
    } finally {
      isPulling.current = false;
    }
  }, []);

  // 2. פונקציית דחיפה לענן
  const pushToCloud = useCallback(async (key: string, data: UserDataContainer) => {
    // הגנה 1: אל תדחוף אם לא סיימת למשוך
    if (!isInitialized.current) {
        console.warn("CloudSync: Blocked push - not initialized.");
        return;
    }

    // הגנה 2: מניעת דחיפה של סטייט ריק אם היה לנו מידע קודם (השסתום המרכזי)
    const currentHash = JSON.stringify(data);
    if (currentHash === lastCloudHash.current) return;
    
    if (data.history.length === 0 && data.webhooks.length === 0 && lastCloudHash.current !== "") {
        console.warn("CloudSync: Blocked push - prevented accidental data wipe.");
        return;
    }

    setSyncStatus('syncing');
    try {
      const response = await fetch(`${SYNC_PROVIDER_URL}${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: currentHash
      });
      
      if (response.ok) {
        lastCloudHash.current = currentHash;
        setSyncStatus('success');
        console.log("CloudSync: Successfully pushed to cloud.");
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      setSyncStatus('error');
    }
  }, []);

  // 3. אפקט טעינה ראשונית
  useEffect(() => {
    const savedUser = localStorage.getItem('chathub_user_v2');
    if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        pullFromCloud(parsed.syncKey);
    } else {
        setIsAuthOpen(true);
        // למשתמש חדש, אפשר להתחיל לסנכרן מיד
        isInitialized.current = true;
    }
  }, [pullFromCloud]);

  // 4. אפקט סנכרון אוטומטי (Debounced)
  useEffect(() => {
    if (!user || !isInitialized.current) return;

    const timer = setTimeout(() => {
      pushToCloud(user.syncKey, { history, webhooks: savedWebhooks });
    }, 2500);

    // תמיד לשמור גם ב-LocalStorage לגיבוי מקומי
    localStorage.setItem('chatHistory', JSON.stringify(history));
    localStorage.setItem('savedWebhooks', JSON.stringify(savedWebhooks));

    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, pushToCloud]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    
    // ניקוי לפני כניסה למשתמש חדש
    isInitialized.current = false;
    lastCloudHash.current = "";
    setHistory([]);
    setSavedWebhooks([]);
    
    setUser(newUser);
    localStorage.setItem('chathub_user_v2', JSON.stringify(newUser));
    setIsAuthOpen(false);
    
    pullFromCloud(syncKey);
  };

  const handleLogout = () => {
    isInitialized.current = false;
    setUser(null);
    setHistory([]);
    setSavedWebhooks([]);
    localStorage.removeItem('chathub_user_v2');
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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-sm">
          <div className="flex items-center gap-2 p-1">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>
              משגר הודעות
            </TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>
              מחולל סקרים
            </TabButton>
          </div>
          <div className="px-6 flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : syncStatus === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {syncStatus === 'syncing' ? 'מסתנכרן...' : syncStatus === 'error' ? 'שגיאת חיבור' : 'הנתונים שמורים בענן'}
             </span>
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
