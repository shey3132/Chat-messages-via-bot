
import React, { useState } from 'react';
import { HistoryItem, SavedWebhook, UserDataContainer } from '../types';
import SharedPreview from './SharedPreview';

interface HistorySidebarProps {
  history: HistoryItem[];
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  username?: string;
  avatar?: string;
  savedWebhooks?: SavedWebhook[];
  onLogout: () => void;
  onImport: (data: UserDataContainer) => void;
}

const HistorySidebar = ({ history, syncStatus, username, avatar, savedWebhooks = [], onLogout, onImport }: HistorySidebarProps) => {
  const [showSyncCode, setShowSyncCode] = useState(false);

  const generateSyncCode = () => {
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    // כיווץ בסיסי והמרה ל-Base64
    const str = JSON.stringify(data);
    const code = btoa(encodeURIComponent(str));
    return code;
  };

  const handlePasteSyncCode = () => {
    const code = prompt('הדבק כאן את קוד הסנכרון מהמחשב השני:');
    if (!code) return;
    try {
      const decoded = decodeURIComponent(atob(code));
      const data = JSON.parse(decoded);
      if (confirm('לייבא נתונים מקוד זה? המידע הקיים יוחלף.')) {
        onImport(data);
      }
    } catch (e) {
      alert('קוד סנכרון לא תקין');
    }
  };

  const handleExport = () => {
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chathub_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <aside className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 flex flex-col h-full max-h-[calc(100vh-10rem)] border border-white overflow-hidden">
      
      {/* User Info Card */}
      <div className="mb-6 p-5 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={onLogout} className="order-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
          <div className="flex-shrink-0 order-2">
            {avatar ? <img src={avatar} className="w-12 h-12 rounded-2xl border-2 border-white/30 object-cover" /> : <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">{username?.charAt(0) || '?'}</div>}
          </div>
          <div className="flex-1 text-right order-1 px-3">
            <h4 className="text-lg font-bold truncate">{username || 'אורח'}</h4>
            <div className="flex items-center gap-1.5 justify-start">
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'success' ? 'bg-green-400' : 'bg-amber-400'}`} />
              <p className="text-[9px] font-bold opacity-80 uppercase">{syncStatus === 'success' ? 'מסונכרן' : 'עבודה מקומית'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* NetFree-Friendly Sync Actions */}
      <div className="bg-slate-50 rounded-[1.5rem] p-4 mb-6 border border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">העברת נתונים (עוקף נטפרי)</span>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => {
              const code = generateSyncCode();
              navigator.clipboard.writeText(code);
              alert('קוד סנכרון הועתק! הדבק אותו במחשב השני.');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 text-xs font-black transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            העתק קוד סנכרון
          </button>
          <button 
            onClick={handlePasteSyncCode}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-indigo-50 text-slate-600 rounded-xl border border-slate-200 text-xs font-black transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" /></svg>
            הזן קוד ממחשב אחר
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-xl font-black text-slate-800 italic">היסטוריה</h3>
        <button onClick={handleExport} className="text-[10px] text-indigo-600 font-bold hover:underline">ייצוא קובץ JSON</button>
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-4 p-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-slate-400 pt-10">אין הודעות</div>
        ) : (
          history.map(item => (
            <div key={item.timestamp} className="border border-slate-100 rounded-[1.8rem] p-4 bg-white shadow-sm">
                <div className="text-[9px] text-slate-400 font-black mb-2 uppercase">
                  {new Date(item.timestamp).toLocaleTimeString('he-IL')}
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/50 mb-3 overflow-hidden">
                  <SharedPreview payload={item.payload} />
                </div>
                <div className="text-[9px] font-bold text-slate-400 truncate px-2">
                    אל: <span className="text-indigo-600">{item.webhookName || 'יעד כללי'}</span>
                </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;
