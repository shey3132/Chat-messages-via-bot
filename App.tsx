
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'connecting';

// שימוש ב-Bucket ייעודי ב-KVDB ליציבות
const KV_BUCKET = 'chathub_v29_stable';
const BASE_URL = `https://kvdb.io/A9zXv6q8y4PqR1w7z9x2/${KV_BUCKET}_`; 
const STORAGE_PREFIX = 'ch_v29_'; 

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

  // משיכת נתונים מהענן
  const fetchFromCloud = useCallback(async (syncKey: string) => {
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${BASE_URL}${syncKey}`);
      if (response.ok) {
        const data: UserDataContainer = await response.json();
        if (data) {
          // מיזוג חכם עם המידע המקומי
          setHistory(prevLocal => {
            const combined = [...(data.history || []), ...prevLocal];
            return Array.from(new Map(combined.map(item => [item.timestamp, item])).values())
                        .sort((a,b) => b.timestamp - a.timestamp)
                        .slice(0, 100);
          });
          setSavedWebhooks(prevLocal => {
            const combined = [...(data.webhooks || []), ...prevLocal];
            return Array.from(new Map(combined.map(item => [item.url, item])).values());
          });
          lastSyncHash.current = JSON.stringify(data);
          setSyncStatus('success');
          return true;
        }
      } else if (response.status === 404) {
        // מפתח חדש, אין עדיין מידע בענן
        setSyncStatus('success');
      }
    } catch (e) {
      console.error("Cloud fetch failed", e);
      setSyncStatus('error');
    }
    return false;
  }, []);

  // שמירה לענן
  const saveToCloud = useCallback(async (data: UserDataContainer) => {
    if (!user || isSyncing.current) return;
    
    const currentHash = JSON.stringify(data);
    if (currentHash === lastSyncHash.current) return;

    isSyncing.current = true;
    setSyncStatus('syncing');

    try {
      const response = await fetch(`${BASE_URL}${user.syncKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: currentHash
      });

      if (response.ok) {
        lastSyncHash.current = currentHash;
        setSyncStatus('success');
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      setSyncStatus('error');
    } finally {
      isSyncing.current = false;
    }
  }, [user]);

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
      fetchFromCloud(parsed.syncKey);
      setIsReady(true);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, [fetchFromCloud]);

  // לופ סנכרון אוטומטי
  useEffect(() => {
    if (!user || !isReady) return;
    
    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));

    const timer = setTimeout(() => {
      saveToCloud({ history, webhooks: savedWebhooks });
    }, 5000); // סנכרון כל 5 שניות משינוי
    
    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, saveToCloud, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
    fetchFromCloud(syncKey);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    if (!confirm('להתנתק? המידע יישמר בענן אך יימחק מהדפדפן הזה.')) return;
    localStorage.clear();
    window.location.reload();
  };

  const triggerManualSync = () => {
    if (user) fetchFromCloud(user.syncKey);
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
                {syncStatus === 'syncing' ? 'סנכרון ענן...' : 
                 syncStatus === 'success' ? 'מחובר לענן' : 
                 syncStatus === 'error' ? 'שגיאת חיבור (מנסה שוב)' : 'שמור מקומית'}
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
              onSetCloudId={() => {}} // מבוטל בגרסה זו
              onResetCloud={() => {}} // מבוטל בגרסה זו
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
