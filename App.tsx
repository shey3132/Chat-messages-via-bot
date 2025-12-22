
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

const STORAGE_PREFIX = 'ch_v31_';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // טעינה מ-LocalStorage (מהיר) וסנכרון ל-State
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

  // שמירה אוטומטית לזיכרון המקומי בכל שינוי
  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(`${STORAGE_PREFIX}history`, JSON.stringify(history));
    localStorage.setItem(`${STORAGE_PREFIX}webhooks`, JSON.stringify(savedWebhooks));
  }, [history, savedWebhooks, isReady]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const newUser = { username, syncKey, avatar };
    setUser(newUser);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    if (confirm('להתנתק? המידע המקומי יימחק. וודא שיש לך הודעת גיבוי בצ\'אט.')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  // פונקציית הגיבוי לצ'אט - שולחת את כל המידע כהודעה
  const backupToChat = async (url: string) => {
    if (!url) return alert('חובה להזין Webhook לשליחת הגיבוי');
    
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    const encodedData = btoa(encodeURIComponent(JSON.stringify(data)));
    
    const payload = {
        text: `📦 *ChatHub v31 - גיבוי מערכת*\nמאת: ${user?.username}\nתאריך: ${new Date().toLocaleString('he-IL')}\n\nכדי לשחזר, העתיקו את הקוד למטה והדביקו באפליקציה:\n\n\`\`\`\nCH_SYNC:${encodedData}\n\`\`\``
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) alert('הגיבוי נשלח לצ\'אט בהצלחה!');
        else alert('שגיאה בשליחת הגיבוי לצ\'אט');
    } catch (e) {
        alert('שגיאת רשת בשליחת הגיבוי');
    }
  };

  const restoreFromCode = (code: string) => {
    try {
        if (!code.startsWith('CH_SYNC:')) return alert('קוד גיבוי לא תקין');
        const encoded = code.replace('CH_SYNC:', '').trim();
        const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
        
        if (decoded.history || decoded.webhooks) {
            if (confirm('האם לשחזר את המידע? המידע הקיים יידרס.')) {
                setHistory(decoded.history || []);
                setSavedWebhooks(decoded.webhooks || []);
                alert('השחזור הושלם בהצלחה!');
            }
        }
    } catch (e) {
        alert('שגיאה בפענוח הקוד. וודא שהעתקת את כל הטקסט במדויק.');
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
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                מצב גיבוי מקומי פעיל (v31)
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
              syncStatus="idle"
              username={user?.username}
              avatar={user?.avatar}
              savedWebhooks={savedWebhooks}
              cloudId="Local Device"
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
                  a.download = `chathub_backup_${new Date().toLocaleDateString()}.json`;
                  a.click();
              }}
              onSetCloudId={() => {
                  const code = prompt('הדבק כאן את קוד הגיבוי מהצ\'אט:');
                  if (code) restoreFromCode(code);
              }}
              onResetCloud={() => {
                  const url = prompt('הדבק Webhook URL למשלוח גיבוי:');
                  if (url) backupToChat(url);
              }}
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
