
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'auth_needed';

const STORAGE_PREFIX = 'ch_v30_';
const GOOGLE_CLIENT_ID = "456093644604-43qt6d36nk36fassgbf1mm6otpav8mti.apps.googleusercontent.com";
const DRIVE_FILE_NAME = 'chathub_sync_data.json';

declare const google: any;

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  
  const accessToken = useRef<string | null>(null);
  const driveFileId = useRef<string | null>(null);
  const lastSyncHash = useRef<string>("");

  // מנגנון קבלת טוקן ל-Drive
  const getDriveToken = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        callback: (response: any) => {
          if (response.error) reject(response);
          accessToken.current = response.access_token;
          resolve(response.access_token);
        },
      });
      client.requestAccessToken({ prompt: '' });
    });
  }, []);

  // מציאת או יצירת קובץ בדרייב
  const findOrCreateFile = async (token: string) => {
    // חיפוש
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${DRIVE_FILE_NAME}'`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const searchData = await searchRes.json();
    
    if (searchData.files && searchData.files.length > 0) {
      driveFileId.current = searchData.files[0].id;
      return searchData.files[0].id;
    }

    // יצירה אם לא קיים
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: DRIVE_FILE_NAME, parents: ['appDataFolder'] })
    });
    const createData = await createRes.json();
    driveFileId.current = createData.id;
    return createData.id;
  };

  const fetchFromDrive = useCallback(async () => {
    if (!accessToken.current) {
        try { await getDriveToken(); } catch(e) { setSyncStatus('auth_needed'); return; }
    }
    setSyncStatus('syncing');
    try {
      const fileId = driveFileId.current || await findOrCreateFile(accessToken.current!);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken.current}` }
      });
      
      if (res.ok) {
        const data: UserDataContainer = await res.json();
        if (data) {
          setHistory(prev => {
            const combined = [...(data.history || []), ...prev];
            return Array.from(new Map(combined.map(item => [item.timestamp, item])).values())
                        .sort((a,b) => b.timestamp - a.timestamp).slice(0, 100);
          });
          setSavedWebhooks(prev => {
            const combined = [...(data.webhooks || []), ...prev];
            return Array.from(new Map(combined.map(item => [item.url, item])).values());
          });
          lastSyncHash.current = JSON.stringify(data);
          setSyncStatus('success');
        }
      }
    } catch (e) {
      setSyncStatus('error');
    }
  }, [getDriveToken]);

  const saveToDrive = useCallback(async (data: UserDataContainer) => {
    if (!accessToken.current || !driveFileId.current) return;
    const currentHash = JSON.stringify(data);
    if (currentHash === lastSyncHash.current) return;

    setSyncStatus('syncing');
    try {
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${driveFileId.current}?uploadType=media`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken.current}`, 'Content-Type': 'application/json' },
        body: currentHash
      });
      lastSyncHash.current = currentHash;
      setSyncStatus('success');
    } catch (e) {
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    const localUser = localStorage.getItem(`${STORAGE_PREFIX}user`);
    const localH = localStorage.getItem(`${STORAGE_PREFIX}history`);
    const localW = localStorage.getItem(`${STORAGE_PREFIX}webhooks`);

    if (localH) { try { setHistory(JSON.parse(localH)); } catch(e){} }
    if (localW) { try { setSavedWebhooks(JSON.parse(localW)); } catch(e){} }

    if (localUser) {
      setUser(JSON.parse(localUser));
      fetchFromDrive();
      setIsReady(true);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, [fetchFromDrive]);

  useEffect(() => {
    if (!user || !isReady) return;
    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));

    const timer = setTimeout(() => {
      saveToDrive({ history, webhooks: savedWebhooks });
    }, 5000);
    return () => clearTimeout(timer);
  }, [history, savedWebhooks, user, saveToDrive, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
    fetchFromDrive();
    setIsAuthOpen(false);
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
                {syncStatus === 'syncing' ? 'סנכרון Drive...' : 
                 syncStatus === 'success' ? 'מחובר ל-Drive' : 
                 syncStatus === 'auth_needed' ? 'נדרש אישור גישה' : 'שמור מקומית'}
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
              cloudId="Google Drive"
              onLogout={() => { localStorage.clear(); window.location.reload(); }}
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
              onManualSync={fetchFromDrive}
            />
          </div>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
