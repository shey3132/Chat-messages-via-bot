
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'local' | 'netfree';

// שימוש ב-JSONBlob - לרוב פתוח בנטפרי
const CLOUD_PROVIDER_URL = 'https://jsonblob.com/api/jsonBlob';
const STORAGE_KEY_V10 = 'ch_v10_';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string, blobId?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  
  const lastCloudDataHash = useRef<string>("");

  // 1. סנכרון מהענן - v10
  const fetchCloudData = useCallback(async (blobId: string) => {
    if (!blobId) return;
    setSyncStatus('syncing');
    console.log(`%c[Sync v10] Fetching: ${blobId}`, "color: #8b5cf6;");

    try {
      const response = await fetch(`${CLOUD_PROVIDER_URL}/${blobId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data: UserDataContainer = await response.json();
        if (data.history) setHistory(data.history);
        if (data.webhooks) setSavedWebhooks(data.webhooks);
        lastCloudDataHash.current = JSON.stringify(data);
        setSyncStatus('success');
      } else if (response.status === 418) {
        setSyncStatus('netfree');
      } else {
        setSyncStatus('local');
      }
    } catch (e) {
      setSyncStatus('local');
    } finally {
      setIsReady(true);
    }
  }, []);

  // 2. שמירה לענן - v10
  const saveToCloud = useCallback(async (data: UserDataContainer) => {
    if (!isReady || !user) return;
    
    const currentHash = JSON.stringify(data);
    if (currentHash === lastCloudDataHash.current) return;

    setSyncStatus('syncing');
    try {
      let response;
      if (user.blobId) {
        // עדכון קיים
        response = await fetch(`${CLOUD_PROVIDER_URL}/${user.blobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: currentHash
        });
      } else {
        // יצירת סל חדש בפעם הראשונה
        response = await fetch(CLOUD_PROVIDER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: currentHash
        });
        if (response.ok) {
          const location = response.headers.get('Location');
          const newBlobId = location?.split('/').pop();
          if (newBlobId) {
            const updatedUser = { ...user, blobId: newBlobId };
            setUser(updatedUser);
            localStorage.setItem('ch_user_v10', JSON.stringify(updatedUser));
          }
        }
      }

      if (response?.ok) {
        lastCloudDataHash.current = currentHash;
        setSyncStatus('success');
      } else if (response?.status === 418) {
        setSyncStatus('netfree');
      } else {
        setSyncStatus('local');
      }
    } catch (e) {
      setSyncStatus('local');
    }
  }, [isReady, user]);

  // 3. טעינה ראשונית
  useEffect(() => {
    const localUser = localStorage.getItem('ch_user_v10');
    const localH = localStorage.getItem('ch_history_v10');
    const localW = localStorage.getItem('ch_webhooks_v10');

    if (localH) setHistory(JSON.parse(localH));
    if (localW) setSavedWebhooks(JSON.parse(localW));

    if (localUser) {
      const parsed = JSON.parse(localUser);
      setUser(parsed);
      if (parsed.blobId) fetchCloudData(parsed.blobId);
      else setIsReady(true);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, [fetchCloudData]);

  // 4. שמירה אוטומטית (מחשב + ענן)
  useEffect(() => {
    if (!user || !isReady) return;

    const timer = setTimeout(() => {
      saveToCloud({ history, webhooks: savedWebhooks });
    }, 3000);

    localStorage.setItem('ch_history_v10', JSON.stringify(history));
    localStorage.setItem('ch_webhooks_v10', JSON.stringify(savedWebhooks));

    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, saveToCloud, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem('ch_user_v10', JSON.stringify(newUser));
    setIsAuthOpen(false);
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
                syncStatus === 'netfree' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                syncStatus === 'local' ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-600'
             }`}>
                <div className={`w-2.2 h-2.2 rounded-full ${
                    syncStatus === 'syncing' ? 'bg-indigo-400 animate-bounce' : 
                    syncStatus === 'netfree' ? 'bg-amber-500' :
                    syncStatus === 'local' ? 'bg-slate-400' : 'bg-green-500'
                }`} />
                {syncStatus === 'syncing' ? 'סנכרון פעיל...' : 
                 syncStatus === 'netfree' ? 'נטפרי חוסם ענן' :
                 syncStatus === 'local' ? 'מצב מקומי' : 'מחובר ומסוגנכר'}
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
              syncStatus={syncStatus === 'syncing' ? 'syncing' : (syncStatus === 'local' || syncStatus === 'netfree') ? 'error' : 'success'}
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
