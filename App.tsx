
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'offline' | 'local';

// שימוש ב-kvdb.io בגרסה 9 עם מפתח חדש
// נמנעים מ-Content-Type: application/json כדי למנוע בקשת OPTIONS preflight שנטפרי חוסמת
const SYNC_BASE_URL = 'https://kvdb.io/S6u8R4q2Wz9M1vXy3N5L7k/'; 
const STORAGE_KEY_PREFIX = 'ch_v9_';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  
  const lastCloudDataHash = useRef<string>("");

  // 1. משיכת נתונים - ללא כותרות כלל למניעת preflight
  const fetchCloudData = useCallback(async (syncKey: string) => {
    setSyncStatus('syncing');
    console.log(`%c[Sync v9] Pulling from cloud...`, "color: #6366f1; font-weight: bold;");

    try {
      const response = await fetch(`${SYNC_BASE_URL}${STORAGE_KEY_PREFIX}${syncKey}`, {
          method: 'GET',
          // אין headers = בקשה "פשוטה"
      });
      
      if (response.ok) {
        const text = await response.text();
        if (text && text !== "null" && text.trim() !== "") {
          try {
            const data: UserDataContainer = JSON.parse(text);
            if (data.history) setHistory(data.history);
            if (data.webhooks) setSavedWebhooks(data.webhooks);
            lastCloudDataHash.current = JSON.stringify({ history: data.history || [], webhooks: data.webhooks || [] });
            setSyncStatus('success');
            console.log("%c[Sync v9] Cloud Sync Complete", "color: green;");
          } catch (pe) {
            console.error("[Sync v9] Parse error", pe);
          }
        } else {
          setSyncStatus('idle');
        }
      } else {
        // בנטפרי/שגיאה נשארים במצב מקומי
        setSyncStatus('local');
      }
    } catch (e) {
      setSyncStatus('local');
      console.warn("[Sync v9] Cloud unreachable, using local mode.");
    } finally {
      setIsReady(true);
    }
  }, []);

  // 2. שמירת נתונים - ללא כותרות כלל
  const saveToCloud = useCallback(async (syncKey: string, data: UserDataContainer) => {
    if (!isReady) return;

    const currentHash = JSON.stringify(data);
    if (currentHash === lastCloudDataHash.current) return;
    
    // מניעת דריסה של מידע קיים ע"י סטייט ריק בטעות
    if (data.history.length === 0 && data.webhooks.length === 0 && lastCloudDataHash.current !== "") return;

    setSyncStatus('syncing');
    try {
      // שליחה כטקסט נקי עוקפת את רוב חסימות ה-CORS בנטפרי
      const response = await fetch(`${SYNC_BASE_URL}${STORAGE_KEY_PREFIX}${syncKey}`, {
        method: 'POST',
        body: currentHash
      });
      
      if (response.ok) {
        lastCloudDataHash.current = currentHash;
        setSyncStatus('success');
      } else {
        setSyncStatus('local');
      }
    } catch (e) {
      setSyncStatus('local');
    }
  }, [isReady]);

  // 3. טעינה ראשונית - LocalStorage תמיד ראשון
  useEffect(() => {
    const localUser = localStorage.getItem('ch_user_v9');
    const localH = localStorage.getItem('ch_history_v9');
    const localW = localStorage.getItem('ch_webhooks_v9');

    if (localH) setHistory(JSON.parse(localH));
    if (localW) setSavedWebhooks(JSON.parse(localW));

    if (localUser) {
      const parsed = JSON.parse(localUser);
      setUser(parsed);
      fetchCloudData(parsed.syncKey);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, [fetchCloudData]);

  // 4. שמירה אוטומטית (Debounced)
  useEffect(() => {
    if (!user || !isReady) return;

    const timer = setTimeout(() => {
      saveToCloud(user.syncKey, { history, webhooks: savedWebhooks });
    }, 2000);

    localStorage.setItem('ch_history_v9', JSON.stringify(history));
    localStorage.setItem('ch_webhooks_v9', JSON.stringify(savedWebhooks));

    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, saveToCloud, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem('ch_user_v9', JSON.stringify(newUser));
    setIsAuthOpen(false);
    fetchCloudData(syncKey);
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setSavedWebhooks([]);
    localStorage.clear();
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100" dir="rtl">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 h-screen flex flex-col gap-6">
        
        {/* Navbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-xl p-2 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2 p-1">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>משגר הודעות</TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>מחולל סקרים</TabButton>
          </div>
          
          <div className="px-6 flex items-center gap-3">
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                syncStatus === 'local' ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-600'
             }`}>
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-indigo-400 animate-pulse' : syncStatus === 'local' ? 'bg-slate-400' : 'bg-green-500'}`} />
                {syncStatus === 'syncing' ? 'מעדכן ענן...' : syncStatus === 'local' ? 'מצב מקומי (ללא ענן)' : 'מסונכרן לענן'}
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          <main className="flex-1 min-h-0">
            {activeApp === 'chatSender' ? (
              <GoogleChatSender 
                saveHistory={(p, url) => {
                    const webhook = savedWebhooks.find(w => w.url === url);
                    setHistory(prev => [{ timestamp: Date.now(), payload: p, webhookUrl: url, webhookName: webhook?.name }, ...prev].slice(0, 50));
                }} 
                savedWebhooks={savedWebhooks}
                onAddWebhook={(w) => setSavedWebhooks(prev => [...prev, w])}
                onDeleteWebhook={(id) => setSavedWebhooks(prev => prev.filter(x => x.id !== id))}
              />
            ) : (
              <OtherApp 
                saveHistory={(p, url) => {
                    const webhook = savedWebhooks.find(w => w.url === url);
                    setHistory(prev => [{ timestamp: Date.now(), payload: p, webhookUrl: url, webhookName: webhook?.name }, ...prev].slice(0, 50));
                }}
                savedWebhooks={savedWebhooks}
                onAddWebhook={(w) => setSavedWebhooks(prev => [...prev, w])}
                onDeleteWebhook={(id) => setSavedWebhooks(prev => prev.filter(x => x.id !== id))}
              />
            )}
          </main>

          <div className="w-full lg:w-96 flex-shrink-0">
            <HistorySidebar 
              history={history} 
              syncStatus={syncStatus === 'syncing' ? 'syncing' : syncStatus === 'local' ? 'error' : 'success'}
              username={user?.username}
              avatar={user?.avatar}
              savedWebhooks={savedWebhooks}
              onLogout={handleLogout}
              onImport={(data) => {
                  setHistory(data.history);
                  setSavedWebhooks(data.webhooks);
              }}
            />
          </div>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
