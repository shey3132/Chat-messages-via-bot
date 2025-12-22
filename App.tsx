
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'offline' | 'blocked';

// Pantry Cloud - שירות יציב יותר שלרוב פתוח בנטפרי
const PANTRY_ID = 'd68f68e7-0841-45a8-a720-911181827464';
const SYNC_BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/`;
const STORAGE_KEY_PREFIX = 'chathub_v8_';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  
  const lastCloudDataHash = useRef<string>("");

  // 1. משיכת נתונים מהענן
  const fetchCloudData = useCallback(async (syncKey: string) => {
    setSyncStatus('syncing');
    console.log(`%c[Sync v8] Checking Cloud...`, "color: #4f46e5; font-weight: bold;");

    try {
      const response = await fetch(`${SYNC_BASE_URL}${STORAGE_KEY_PREFIX}${syncKey}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data: UserDataContainer = await response.json();
        if (data.history) setHistory(data.history);
        if (data.webhooks) setSavedWebhooks(data.webhooks);
        lastCloudDataHash.current = JSON.stringify({ history: data.history || [], webhooks: data.webhooks || [] });
        setSyncStatus('success');
        console.log("%c[Sync v8] Cloud Synced", "color: green;");
      } else if (response.status === 418) {
        setSyncStatus('blocked'); // חסום בנטפרי
        console.warn("[Sync v8] Blocked by NetFree filter");
      } else {
        setSyncStatus('idle'); // כנראה סל חדש
      }
    } catch (e) {
      setSyncStatus('offline');
      console.warn("[Sync v8] Working in offline mode");
    } finally {
      setIsReady(true);
    }
  }, []);

  // 2. שמירת נתונים לענן
  const saveToCloud = useCallback(async (syncKey: string, data: UserDataContainer) => {
    if (!isReady || syncStatus === 'blocked') return;

    const currentHash = JSON.stringify(data);
    if (currentHash === lastCloudDataHash.current) return;
    if (data.history.length === 0 && data.webhooks.length === 0 && lastCloudDataHash.current !== "") return;

    setSyncStatus('syncing');
    try {
      // Pantry משתמש ב-POST ליצירה ו-PUT לעדכון. נשתמש ב-POST כברירת מחדל
      const response = await fetch(`${SYNC_BASE_URL}${STORAGE_KEY_PREFIX}${syncKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: currentHash
      });
      
      if (response.ok) {
        lastCloudDataHash.current = currentHash;
        setSyncStatus('success');
      } else if (response.status === 418) {
        setSyncStatus('blocked');
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      setSyncStatus('offline');
    }
  }, [isReady, syncStatus]);

  // 3. טעינה ראשונית - מהירות היא הכל
  useEffect(() => {
    const localUser = localStorage.getItem('chathub_user_v8');
    const localH = localStorage.getItem('chatHistory_v8');
    const localW = localStorage.getItem('savedWebhooks_v8');

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

  // 4. שמירה אוטומטית למחשב ולענן
  useEffect(() => {
    if (!user || !isReady) return;

    const timer = setTimeout(() => {
      saveToCloud(user.syncKey, { history, webhooks: savedWebhooks });
    }, 2500);

    localStorage.setItem('chatHistory_v8', JSON.stringify(history));
    localStorage.setItem('savedWebhooks_v8', JSON.stringify(savedWebhooks));

    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, saveToCloud, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem('chathub_user_v8', JSON.stringify(newUser));
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
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                syncStatus === 'blocked' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                syncStatus === 'error' || syncStatus === 'offline' ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-600'
             }`}>
                <div className={`w-2.2 h-2.2 rounded-full ${
                    syncStatus === 'syncing' ? 'bg-indigo-400 animate-bounce' : 
                    syncStatus === 'blocked' ? 'bg-amber-500' :
                    syncStatus === 'error' || syncStatus === 'offline' ? 'bg-slate-400' : 'bg-green-500'
                }`} />
                {syncStatus === 'syncing' ? 'מנסה לסנכרן...' : 
                 syncStatus === 'blocked' ? 'סנכרון מושהה (נטפרי?)' :
                 syncStatus === 'error' || syncStatus === 'offline' ? 'עובד מקומית' : 'מסונכרן לענן'}
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
              syncStatus={syncStatus === 'syncing' ? 'syncing' : (syncStatus === 'error' || syncStatus === 'offline' || syncStatus === 'blocked') ? 'error' : 'success'}
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
