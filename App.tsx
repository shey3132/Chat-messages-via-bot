
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'no_folder';

const STORAGE_PREFIX = 'ch_v33_';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('no_folder');
  const [isReady, setIsReady] = useState(false);
  
  const fileHandle = useRef<any>(null);
  const lastSavedHash = useRef<string>("");

  // פונקציה לחיבור תיקייה / קובץ סנכרון
  const connectSyncFile = async () => {
    try {
      // @ts-ignore
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'ChatHub Sync File',
          accept: { 'application/json': ['.json'] },
        }],
        multiple: false
      }).catch(async () => {
         // אם הקובץ לא קיים, נבקש ליצור אחד
         // @ts-ignore
         return [await window.showSaveFilePicker({
            suggestedName: 'chathub_sync.json',
            types: [{ description: 'ChatHub Sync File', accept: { 'application/json': ['.json'] } }]
         })];
      });

      fileHandle.current = handle;
      
      // קריאת המידע הקיים מהקובץ
      const file = await handle.getFile();
      const content = await file.text();
      if (content) {
        const data: UserDataContainer = JSON.parse(content);
        if (data.history) setHistory(data.history);
        if (data.webhooks) setSavedWebhooks(data.webhooks);
        lastSavedHash.current = JSON.stringify(data);
      }
      
      setSyncStatus('success');
    } catch (e) {
      console.error("File access denied or failed", e);
      setSyncStatus('error');
    }
  };

  const saveToFile = useCallback(async (data: UserDataContainer) => {
    if (!fileHandle.current) return;
    
    const currentHash = JSON.stringify(data);
    if (currentHash === lastSavedHash.current) return;

    try {
      setSyncStatus('syncing');
      // @ts-ignore
      const writable = await fileHandle.current.createWritable();
      await writable.write(currentHash);
      await writable.close();
      lastSavedHash.current = currentHash;
      setSyncStatus('success');
    } catch (e) {
      console.error("Failed to save to file", e);
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
      setIsReady(true);
    } else {
      setIsAuthOpen(true);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));

    const timer = setTimeout(() => {
      saveToFile({ history, webhooks: savedWebhooks });
    }, 2000);
    return () => clearTimeout(timer);
  }, [history, savedWebhooks, isReady, saveToFile]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
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
             <button 
                onClick={connectSyncFile}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                syncStatus === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 
                syncStatus === 'syncing' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                syncStatus === 'no_folder' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                'bg-red-50 text-red-600 border border-red-100'
             }`}>
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-indigo-400 animate-pulse' : syncStatus === 'success' ? 'bg-green-500' : 'bg-amber-400'}`} />
                {syncStatus === 'syncing' ? 'שומר שינויים...' : 
                 syncStatus === 'success' ? 'סנכרון פעיל' : 
                 syncStatus === 'no_folder' ? 'לחץ לחיבור תיקיית סנכרון' : 'שגיאת גישה'}
             </button>
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
              cloudId={fileHandle.current ? "מחובר לקובץ" : null}
              onLogout={() => { localStorage.clear(); window.location.reload(); }}
              onImportFile={(e) => {}} 
              onExportFile={() => {}} 
              onSetCloudId={connectSyncFile}
              onResetCloud={() => { fileHandle.current = null; setSyncStatus('no_folder'); }}
              onManualSync={() => {}}
            />
          </div>
        </div>
      </div>

      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      <Analytics />
    </div>
  );
}
