
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

const STORAGE_PREFIX = 'ch_v32_';
const PANTRY_ID = '964e526a-93be-46be-9602-094031633458'; // Pantry ID ייעודי ל-ChatHub
const BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/`;

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  
  const lastSyncHash = useRef<string>("");
  const isSyncing = useRef<boolean>(false);

  // פונקציית סנכרון מול Pantry
  const syncWithCloud = useCallback(async (syncKey: string, dataToSave?: UserDataContainer) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    setSyncStatus('syncing');

    try {
      if (dataToSave) {
        // שמירה לענן
        const currentHash = JSON.stringify(dataToSave);
        if (currentHash === lastSyncHash.current) {
          setSyncStatus('success');
          isSyncing.current = false;
          return;
        }

        await fetch(`${BASE_URL}${syncKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: currentHash
        });
        lastSyncHash.current = currentHash;
      } else {
        // משיכה מהענן
        const response = await fetch(`${BASE_URL}${syncKey}`);
        if (response.ok) {
          const cloudData: UserDataContainer = await response.json();
          if (cloudData) {
            setHistory(prev => {
                const combined = [...(cloudData.history || []), ...prev];
                const unique = Array.from(new Map(combined.map(item => [item.timestamp, item])).values())
                                    .sort((a,b) => b.timestamp - a.timestamp)
                                    .slice(0, 100);
                return unique;
            });
            setSavedWebhooks(prev => {
                const combined = [...(cloudData.webhooks || []), ...prev];
                return Array.from(new Map(combined.map(item => [item.url, item])).values());
            });
            lastSyncHash.current = JSON.stringify(cloudData);
          }
        }
      }
      setSyncStatus('success');
    } catch (e) {
      console.error("Sync failed", e);
      setSyncStatus('error');
    } finally {
      isSyncing.current = false;
    }
  }, []);

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
      syncWithCloud(parsed.syncKey);
      setIsReady(true);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, [syncWithCloud]);

  // לופ שמירה אוטומטי (Debounced)
  useEffect(() => {
    if (!user || !isReady) return;
    
    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));

    const timer = setTimeout(() => {
      syncWithCloud(user.syncKey, { history, webhooks: savedWebhooks });
    }, 3000); 
    
    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, syncWithCloud, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
    syncWithCloud(syncKey);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    if (confirm('להתנתק? המידע יישמר בענן ויימחק מהדפדפן הנוכחי.')) {
        localStorage.clear();
        window.location.reload();
    }
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
                syncStatus === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
                'bg-slate-100 text-slate-500 border border-slate-200'
             }`}>
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-indigo-400 animate-pulse' : syncStatus === 'success' ? 'bg-green-500' : syncStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'}`} />
                {syncStatus === 'syncing' ? 'מסנכרן ענן...' : 
                 syncStatus === 'success' ? 'המידע מגובה בענן' : 
                 syncStatus === 'error' ? 'שגיאת סנכרון' : 'מחובר'}
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
              syncStatus={syncStatus}
              username={user?.username}
              avatar={user?.avatar}
              savedWebhooks={savedWebhooks}
              cloudId={user?.syncKey || null}
              onLogout={handleLogout}
              onImportFile={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target?.result as string);
                        setHistory(data.history || []);
                        setSavedWebhooks(data.webhooks || []);
                    } catch(e) { alert('קובץ לא תקין'); }
                  };
                  reader.readAsText(file);
              }}
              onExportFile={() => {
                  const data = JSON.stringify({ history, webhooks: savedWebhooks });
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `chathub_backup.json`;
                  a.click();
              }}
              onSetCloudId={() => {}} 
              onResetCloud={() => {}} 
              onManualSync={() => user && syncWithCloud(user.syncKey)}
            />
          </div>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
