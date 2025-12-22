
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

const DATA_PROVIDER = 'https://api.npoint.io/';
// מזהה מרכזייה חדש ויציב יותר לגרסה 20
const DISCOVERY_HUB_ID = 'dc830c11516e87a20c9a'; 
const STORAGE_PREFIX = 'ch_v20_';

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
  const retryTimeout = useRef<any>(null);

  const isValidId = (id: string | null) => {
    if (!id || id === 'null' || id === 'undefined' || id.length > 30 || id.length < 4) return false;
    return /^[a-z0-9]+$/i.test(id);
  };

  // משיכת נתונים מהענן עם טיפול בשגיאות
  const fetchCloudData = useCallback(async (id: string) => {
    if (!isValidId(id)) return;
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${DATA_PROVIDER}${id}`);
      if (response.ok) {
        const data: UserDataContainer = await response.json();
        if (data && (Array.isArray(data.history) || Array.isArray(data.webhooks))) {
          setHistory(data.history || []);
          setSavedWebhooks(data.webhooks || []);
          lastCloudDataHash.current = JSON.stringify(data);
          setSyncStatus('success');
          return true;
        }
      }
    } catch (e) {}
    setSyncStatus('local');
    return false;
  }, []);

  // חיפוש אוטומטי חסין תקלות
  const discoverUserCloud = useCallback(async (syncKey: string) => {
    setSyncStatus('discovering');
    try {
      const response = await fetch(`${DATA_PROVIDER}${DISCOVERY_HUB_ID}`);
      // אם השרת מחזיר 500 או 404, אנחנו לא נכשלים, פשוט ממשיכים כחדשים
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
    } catch (e) {
      console.warn("Discovery hub temporarily unavailable, operating in local-first mode.");
    }
    setSyncStatus('no_key');
    return null;
  }, [fetchCloudData]);

  // רישום שקט במרכזייה
  const registerInHub = async (syncKey: string, newCloudId: string) => {
    try {
      const hubRes = await fetch(`${DATA_PROVIDER}${DISCOVERY_HUB_ID}`);
      let hub: Record<string, string> = {};
      if (hubRes.ok) {
        try { hub = await hubRes.json(); } catch(e) {}
      }
      
      if (hub[syncKey] === newCloudId) return;

      hub[syncKey] = newCloudId;
      await fetch(`${DATA_PROVIDER}${DISCOVERY_HUB_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(hub)
      });
    } catch (e) {}
  };

  const saveToCloud = useCallback(async (data: UserDataContainer) => {
    if (!isReady || !user) return;
    const currentHash = JSON.stringify(data);
    if (currentHash === lastCloudDataHash.current) return;
    
    // מונע שמירה של מבנה ריק אם כבר יש מידע בענן
    if (data.history.length === 0 && data.webhooks.length === 0 && lastCloudDataHash.current !== "") return;

    setSyncStatus('syncing');
    try {
      const isExisting = isValidId(cloudId);
      const url = isExisting ? `${DATA_PROVIDER}${cloudId}` : DATA_PROVIDER;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: currentHash
      });

      if (response.ok) {
        const resData = await response.json();
        if (!isExisting && resData.id) {
          const newId = resData.id;
          setCloudId(newId);
          localStorage.setItem(`${STORAGE_PREFIX}cloud_id_${user.syncKey}`, newId);
          await registerInHub(user.syncKey, newId);
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

  useEffect(() => {
    if (!user || !isReady) return;
    const timer = setTimeout(() => {
      saveToCloud({ history, webhooks: savedWebhooks });
    }, 3000);
    
    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));
    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, saveToCloud, isReady]);

  const handleLogin = async (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
    setIsAuthOpen(false);
    
    const savedId = localStorage.getItem(`${STORAGE_PREFIX}cloud_id_${syncKey}`);
    if (isValidId(savedId)) {
      setCloudId(savedId!);
      fetchCloudData(savedId!);
    } else {
      await discoverUserCloud(syncKey);
    }
  };

  const handleLogout = () => {
    if (!confirm('להתנתק? המידע יישמר בענן ויחזור כשתתחבר שוב.')) return;
    setUser(null);
    setCloudId(null);
    setHistory([]);
    setSavedWebhooks([]);
    localStorage.removeItem(`${STORAGE_PREFIX}user`);
    // אנחנו משאירים את ה-Cloud ID בלוקאל למקרה של התחברות מהירה, אבל מנקים הכל מסביב
    setIsAuthOpen(true);
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
                syncStatus === 'local' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-amber-50 text-amber-600 border border-amber-100'
             }`}>
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' || syncStatus === 'discovering' ? 'bg-indigo-400 animate-pulse' : syncStatus === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-400'}`} />
                {syncStatus === 'discovering' ? 'מחפש גיבוי...' :
                 syncStatus === 'syncing' ? 'מסנכרן...' : 
                 syncStatus === 'success' ? 'מחובר לענן' : 'מצב מקומי'}
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
                fetchCloudData(id);
              }}
              onResetCloud={() => setCloudId(null)}
            />
          </div>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
