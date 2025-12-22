
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'local' | 'no_key';

const DATA_PROVIDER = 'https://api.npoint.io/';
const STORAGE_PREFIX = 'ch_v14_';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [cloudId, setCloudId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  
  const lastCloudDataHash = useRef<string>("");

  // משיכת נתונים - רק אם יש מפתח
  const fetchCloudData = useCallback(async (id: string) => {
    if (!id || id === 'null' || id.length < 5) return;
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${DATA_PROVIDER}${id}`);
      if (response.ok) {
        const data: UserDataContainer = await response.json();
        if (data && (data.history || data.webhooks)) {
          setHistory(data.history || []);
          setSavedWebhooks(data.webhooks || []);
          lastCloudDataHash.current = JSON.stringify(data);
          setSyncStatus('success');
        }
      } else if (response.status === 404) {
        setSyncStatus('no_key');
      }
    } catch (e) {
      setSyncStatus('local');
    }
  }, []);

  // שמירה לענן - v14 (ללא Headers לעקיפת נטפרי)
  const saveToCloud = useCallback(async (data: UserDataContainer) => {
    if (!isReady || !user) return;
    
    const currentHash = JSON.stringify(data);
    if (currentHash === lastCloudDataHash.current) return;
    if (data.history.length === 0 && data.webhooks.length === 0) return;

    setSyncStatus('syncing');
    
    try {
      const url = cloudId ? `${DATA_PROVIDER}${cloudId}` : DATA_PROVIDER;
      
      const response = await fetch(url, {
        method: 'POST',
        // שולחים כטקסט נקי כדי שנטפרי לא יזהה את זה כ-API מורכב
        body: currentHash
      });

      if (response.ok) {
        const resData = await response.json();
        if (!cloudId && resData.id) {
          const newId = resData.id;
          setCloudId(newId);
          localStorage.setItem(`${STORAGE_PREFIX}cloud_id_${user.syncKey}`, newId);
        }
        lastCloudDataHash.current = currentHash;
        setSyncStatus('success');
      } else {
        setSyncStatus('local');
      }
    } catch (e) {
      setSyncStatus('local');
    }
  }, [isReady, user, cloudId]);

  // טעינה ראשונית
  useEffect(() => {
    const localUser = localStorage.getItem(`${STORAGE_PREFIX}user`);
    const localH = localStorage.getItem(`${STORAGE_PREFIX}history`);
    const localW = localStorage.getItem(`${STORAGE_PREFIX}webhooks`);

    if (localH) setHistory(JSON.parse(localH));
    if (localW) setSavedWebhooks(JSON.parse(localW));

    if (localUser) {
      const parsed = JSON.parse(localUser);
      setUser(parsed);
      const savedId = localStorage.getItem(`${STORAGE_PREFIX}cloud_id_${parsed.syncKey}`);
      if (savedId) {
        setCloudId(savedId);
        fetchCloudData(savedId);
      } else {
        setSyncStatus('no_key');
      }
      setIsReady(true);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, [fetchCloudData]);

  // שמירה אוטומטית
  useEffect(() => {
    if (!user || !isReady) return;

    const timer = setTimeout(() => {
      saveToCloud({ history, webhooks: savedWebhooks });
    }, 5000);

    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));

    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, saveToCloud, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
    setIsAuthOpen(false);
    
    const savedId = localStorage.getItem(`${STORAGE_PREFIX}cloud_id_${syncKey}`);
    if (savedId) {
      setCloudId(savedId);
      fetchCloudData(savedId);
    } else {
      setSyncStatus('no_key');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCloudId(null);
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
          
          <div className="px-6">
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                syncStatus === 'success' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
             }`}>
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-indigo-400 animate-pulse' : syncStatus === 'success' ? 'bg-green-500' : 'bg-amber-400'}`} />
                {syncStatus === 'syncing' ? 'מסנכרן...' : 
                 syncStatus === 'no_key' ? 'ממתין להגדרה' : 
                 syncStatus === 'success' ? 'ענן פעיל' : 'מצב מקומי'}
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
              syncStatus={syncStatus === 'syncing' ? 'syncing' : syncStatus === 'success' ? 'success' : 'error'}
              username={user?.username}
              avatar={user?.avatar}
              savedWebhooks={savedWebhooks}
              cloudId={cloudId}
              onLogout={handleLogout}
              onImport={(data) => {
                  setHistory(data.history || []);
                  setSavedWebhooks(data.webhooks || []);
              }}
              onSetCloudId={(id) => {
                setCloudId(id);
                if (user) localStorage.setItem(`${STORAGE_PREFIX}cloud_id_${user.syncKey}`, id);
                fetchCloudData(id);
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
