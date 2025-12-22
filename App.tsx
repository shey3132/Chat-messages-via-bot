
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'local' | 'no_key' | 'discovering';

const DATA_PROVIDER = 'https://api.npoint.io';
const STORAGE_PREFIX = 'ch_v27_'; 

const HUB_SHARDS: Record<string, string> = {
  '0': 'b738495f36e47f763a86', '1': 'c29384f5a6b7c8d9e0f1', '2': 'a1b2c3d4e5f6a7b8c9d0',
  '3': 'f1e2d3c4b5a6f7e8d9c0', '4': '5a6b7c8d9e0f1a2b3c4d', '5': 'e5f6a7b8c9d0e1f2a3b4',
  '6': 'd4c3b2a1f0e9d8c7b6a5', '7': 'c9d8b7a6f5e4d3c2b1a0', '8': '7a8b9c0d1e2f3a4b5c6d',
  '9': '2b3c4d5e6f7a8b9c0d1e', 'a': 'dc830c11516e87a20c9a', 'b': 'f0e1d2c3b4a5f6e7d8c9',
  'c': 'a5b4c3d2e1f0a9b8c7d6', 'd': '9d8c7b6a5f4e3d2c1b0a', 'e': '1a2b3c4d5e6f7g8h9i0j',
  'f': '0j9i8h7g6f5e4d3c2b1a'
};

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
  const isSyncLocked = useRef<boolean>(false);

  const isValidId = (id: string | null) => {
    if (!id || id === 'null' || id === 'undefined' || id.length > 30 || id.length < 4) return false;
    return /^[a-z0-9]+$/i.test(id);
  };

  const mergeData = useCallback((cloudData: UserDataContainer) => {
    setHistory(prevLocal => {
      const combined = [...(cloudData.history || []), ...prevLocal];
      // הסרת כפילויות לפי טיימסטמפ ומיון מחדש
      const unique = Array.from(new Map(combined.map(item => [item.timestamp, item])).values())
                        .sort((a,b) => b.timestamp - a.timestamp)
                        .slice(0, 100);
      return unique;
    });

    setSavedWebhooks(prevLocal => {
      const combined = [...(cloudData.webhooks || []), ...prevLocal];
      const unique = Array.from(new Map(combined.map(item => [item.url, item])).values());
      return unique;
    });
  }, []);

  const fetchCloudData = useCallback(async (id: string) => {
    if (!isValidId(id)) return;
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${DATA_PROVIDER}/${id}`);
      if (response.ok) {
        const data: UserDataContainer = await response.json();
        if (data) {
          mergeData(data);
          lastCloudDataHash.current = JSON.stringify({ history: data.history, webhooks: data.webhooks });
          setSyncStatus('success');
          return true;
        }
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
    setSyncStatus('local');
    return false;
  }, [mergeData]);

  const discoverUserCloud = useCallback(async (syncKey: string) => {
    setSyncStatus('discovering');
    const shardId = HUB_SHARDS[syncKey.charAt(0).toLowerCase()] || HUB_SHARDS['a'];
    try {
      const response = await fetch(`${DATA_PROVIDER}/${shardId}`);
      if (response.ok) {
        const hub: Record<string, string> = await response.json();
        const foundId = hub[syncKey];
        if (foundId && isValidId(foundId)) {
          setCloudId(foundId);
          localStorage.setItem(`${STORAGE_PREFIX}cloud_id_${syncKey}`, foundId);
          await fetchCloudData(foundId);
          return foundId;
        }
      }
    } catch (e) {}
    setSyncStatus('local');
    return null;
  }, [fetchCloudData]);

  const saveToCloud = useCallback(async (data: UserDataContainer) => {
    if (!isReady || !user || isSyncLocked.current) return;
    
    const currentHash = JSON.stringify(data);
    if (currentHash === lastCloudDataHash.current) return;

    isSyncLocked.current = true;
    setSyncStatus('syncing');

    try {
      const isExisting = isValidId(cloudId);
      // תיקון: אם המזהה קיים משתמשים ב-PUT לעדכון. אם לא, POST ליצירה חדשה.
      const url = isExisting ? `${DATA_PROVIDER}/${cloudId}` : `${DATA_PROVIDER}/bins`;
      const method = isExisting ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: currentHash
      });

      if (response.ok) {
        const resData = await response.json();
        const newId = isExisting ? cloudId : resData.id;
        
        if (newId && isValidId(newId)) {
          if (!isExisting) {
            setCloudId(newId);
            localStorage.setItem(`${STORAGE_PREFIX}cloud_id_${user.syncKey}`, newId);
            // רישום ב-Hub
            const shardId = HUB_SHARDS[user.syncKey.charAt(0).toLowerCase()] || HUB_SHARDS['a'];
            const hubRes = await fetch(`${DATA_PROVIDER}/${shardId}`);
            let hub = hubRes.ok ? await hubRes.json() : {};
            hub[user.syncKey] = newId;
            await fetch(`${DATA_PROVIDER}/${shardId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(hub)
            });
          }
          lastCloudDataHash.current = currentHash;
          setSyncStatus('success');
        }
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      setSyncStatus('error');
    } finally {
      isSyncLocked.current = false;
    }
  }, [isReady, user, cloudId]);

  // טעינה ראשונית
  useEffect(() => {
    const localUser = localStorage.getItem(`${STORAGE_PREFIX}user`);
    const localH = localStorage.getItem(`${STORAGE_PREFIX}history`);
    const localW = localStorage.getItem(`${STORAGE_PREFIX}webhooks`);

    if (localH) { try { setHistory(JSON.parse(localH)); } catch(e){} }
    if (localW) { try { setSavedWebhooks(JSON.parse(localW)); } catch(e){} }

    if (localUser) {
      const parsed = JSON.parse(localUser);
      setUser(parsed);
      const savedId = localStorage.getItem(`${STORAGE_PREFIX}cloud_id_${parsed.syncKey}`);
      if (isValidId(savedId)) {
        setCloudId(savedId!);
        fetchCloudData(savedId!);
      } else {
        discoverUserCloud(parsed.syncKey);
      }
      setIsReady(true);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, [fetchCloudData, discoverUserCloud]);

  // לופ סנכרון ושמירה מקומית
  useEffect(() => {
    if (!user || !isReady) return;
    
    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));

    const timer = setTimeout(() => {
      saveToCloud({ history, webhooks: savedWebhooks });
    }, 10000); 
    
    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, saveToCloud, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
    const savedId = localStorage.getItem(`${STORAGE_PREFIX}cloud_id_${syncKey}`);
    if (isValidId(savedId)) {
      setCloudId(savedId!);
      fetchCloudData(savedId!);
    } else {
      discoverUserCloud(syncKey);
    }
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    if (!confirm('להתנתק? המידע יישאר בענן אך יימחק מהדפדפן הזה.')) return;
    localStorage.clear();
    window.location.reload();
  };

  const triggerManualSync = () => {
    if (cloudId) fetchCloudData(cloudId);
    else if (user) discoverUserCloud(user.syncKey);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100" dir="rtl">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 h-screen flex flex-col gap-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-xl p-2 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2 p-1">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>משגר הודעות</TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>מחולל סקרים</TabButton>
          </div>
          
          <div className="px-6 flex items-center gap-4">
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                syncStatus === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 
                syncStatus === 'syncing' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                'bg-slate-100 text-slate-500 border border-slate-200'
             }`}>
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-indigo-400 animate-pulse' : syncStatus === 'success' ? 'bg-green-500' : 'bg-slate-400'}`} />
                {syncStatus === 'discovering' ? 'מחפש גיבוי...' :
                 syncStatus === 'syncing' ? 'מסנכרן לענן...' : 
                 syncStatus === 'success' ? 'מסונכרן לענן' : 
                 syncStatus === 'error' ? 'שגיאת סנכרון (מנסה שוב...)' : 'שמור מקומית'}
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          <main className="flex-1 min-h-0">
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

          <div className="w-full lg:w-96 flex-shrink-0">
            <HistorySidebar 
              history={history} 
              syncStatus={syncStatus === 'syncing' ? 'syncing' : syncStatus === 'success' ? 'success' : 'idle'}
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
                fetchCloudData(id);
              }}
              onResetCloud={() => setCloudId(null)}
              onManualSync={triggerManualSync}
            />
          </div>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
