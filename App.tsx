
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncLifecycle = 'BOOTING' | 'PULLING' | 'READY' | 'ERROR';

// שרת סנכרון חדש ויציב יותר עם תמיכה מלאה ב-CORS
const SYNC_PROVIDER_URL = 'https://keyvalue.impressed.nl/api/keyvalue/'; 
const VERSION_KEY_PREFIX = 'chathub_final_v5_';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [lifecycle, setLifecycle] = useState<SyncLifecycle>('BOOTING');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  
  const lastCloudDataHash = useRef<string>("");

  // 1. פונקציה למשיכת נתונים - ללא Headers שגורמים ל-CORS Preflight
  const initializeData = useCallback(async (syncKey: string) => {
    setLifecycle('PULLING');
    setSyncStatus('syncing');
    
    // קודם כל - נטען מהר מהלוקאל כדי שהמשתמש יראה משהו מייד
    const localH = localStorage.getItem('chatHistory_v5');
    const localW = localStorage.getItem('savedWebhooks_v5');
    if (localH) setHistory(JSON.parse(localH));
    if (localW) setSavedWebhooks(JSON.parse(localW));

    console.log("%c[Sync] Fetching from cloud...", "color: blue; font-weight: bold;");

    try {
      // בקשה נקייה ללא Custom Headers כדי להימנע מ-CORS OPTIONS request
      const response = await fetch(`${SYNC_PROVIDER_URL}${VERSION_KEY_PREFIX}${syncKey}`);
      
      if (response.ok) {
        const rawData = await response.text();
        if (rawData && rawData !== "null") {
          const data: UserDataContainer = JSON.parse(rawData);
          console.log("%c[Sync] Cloud data retrieved.", "color: green;");
          
          const remoteHistory = data.history || [];
          const remoteWebhooks = data.webhooks || [];
          
          setHistory(remoteHistory);
          setSavedWebhooks(remoteWebhooks);
          lastCloudDataHash.current = JSON.stringify({ history: remoteHistory, webhooks: remoteWebhooks });
        }
      } else {
        console.warn("[Sync] Cloud empty or unreachable, status:", response.status);
      }
    } catch (e) {
      console.error("[Sync] Network/CORS error:", e);
      setSyncStatus('error');
    } finally {
      // תמיד עוברים ל-READY כדי לא לחסום את המשתמש
      setTimeout(() => {
        setLifecycle('READY');
        if (syncStatus !== 'error') setSyncStatus('success');
      }, 500);
    }
  }, []);

  // 2. פונקציית שמירה - אופטימיזציה למניעת Preflight
  const persistToCloud = useCallback(async (syncKey: string, data: UserDataContainer) => {
    if (lifecycle !== 'READY') return;

    const currentHash = JSON.stringify(data);
    if (currentHash === lastCloudDataHash.current) return;

    // הגנה: לא דורסים אם הסטייט ריק ובעבר היה מידע
    if (data.history.length === 0 && data.webhooks.length === 0 && lastCloudDataHash.current !== "") {
        return;
    }

    setSyncStatus('syncing');
    try {
      await fetch(`${SYNC_PROVIDER_URL}${VERSION_KEY_PREFIX}${syncKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // שימוש ב-text/plain מונע Preflight ברוב המקרים
        body: currentHash
      });
      lastCloudDataHash.current = currentHash;
      setSyncStatus('success');
    } catch (e) {
      console.error("[Sync] Save failed");
      setSyncStatus('error');
    }
  }, [lifecycle]);

  // 3. טעינה ראשונית
  useEffect(() => {
    const savedUser = localStorage.getItem('chathub_user_v5');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      initializeData(parsed.syncKey);
    } else {
      setIsAuthOpen(true);
      setLifecycle('READY');
    }
  }, [initializeData]);

  // 4. שמירה אוטומטית
  useEffect(() => {
    if (!user || lifecycle !== 'READY') return;

    const timer = setTimeout(() => {
      persistToCloud(user.syncKey, { history, webhooks: savedWebhooks });
    }, 2000);

    // תמיד לשמור מקומית
    localStorage.setItem('chatHistory_v5', JSON.stringify(history));
    localStorage.setItem('savedWebhooks_v5', JSON.stringify(savedWebhooks));

    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, persistToCloud, lifecycle]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setLifecycle('BOOTING');
    setUser(newUser);
    localStorage.setItem('chathub_user_v5', JSON.stringify(newUser));
    setIsAuthOpen(false);
    initializeData(syncKey);
  };

  const handleLogout = () => {
    setLifecycle('BOOTING');
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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-sm">
          <div className="flex items-center gap-2 p-1">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>משגר הודעות</TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>מחולל סקרים</TabButton>
          </div>
          <div className="px-6 flex items-center gap-3">
             <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                syncStatus === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
             }`}>
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : syncStatus === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
                {syncStatus === 'error' ? 'שגיאת סנכרון (עובד מקומית)' : syncStatus === 'syncing' ? 'מעדכן ענן...' : 'הנתונים מסונכרנים'}
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
