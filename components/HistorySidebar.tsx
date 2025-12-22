
import React from 'react';
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
  
  const generateSyncCode = () => {
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    try {
        return btoa(encodeURIComponent(JSON.stringify(data)));
    } catch (e) {
        return "";
    }
  };

  const handlePasteSyncCode = () => {
    const code = prompt('הדבק כאן את קוד הסנכרון מהמחשב השני:');
    if (!code) return;
    try {
      const decoded = decodeURIComponent(atob(code));
      const data = JSON.parse(decoded);
      if (confirm('לייבא נתונים? המידע הקיים יוחלף.')) {
        onImport(data);
      }
    } catch (e) {
      alert('קוד לא תקין');
    }
  };

  const handleExport = () => {
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chathub_backup.json`;
    a.click();
  };

  return (
    <aside className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 flex flex-col h-full max-h-[calc(100vh-10rem)] border border-white overflow-hidden">
      
      {/* User Card */}
      <div className="mb-6 p-5 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={onLogout} className="order-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
          <div className="flex-shrink-0 order-2">
            {avatar ? <img src={avatar} className="w-12 h-12 rounded-2xl border-2 border-white/30 object-cover" /> : <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">{username?.charAt(0) || '?'}</div>}
          </div>
          <div className="flex-1 text-right order-1 px-3">
            <h4 className="text-lg font-bold truncate">{username || 'אורח'}</h4>
            <div className="flex items-center gap-1.5 justify-start">
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'success' ? 'bg-green-400' : 'bg-slate-400'}`} />
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">
                {syncStatus === 'success' ? 'מחובר לענן' : 'מצב מקומי'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Sync (Bypasses all filters) */}
      <div className="bg-slate-50 rounded-[1.8rem] p-4 mb-6 border border-slate-100 shadow-inner">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block mb-3 text-center">סנכרון ידני (עוקף נטפרי)</span>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => { navigator.clipboard.writeText(generateSyncCode()); alert('קוד הועתק! הדבק אותו במחשב השני.'); }}
            className="flex flex-col items-center gap-1 py-3 bg-white hover:bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012-2" /></svg>
            <span className="text-[10px] font-bold">העתק קוד</span>
          </button>
          <button 
            onClick={handlePasteSyncCode}
            className="flex flex-col items-center gap-1 py-3 bg-white hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /></svg>
            <span className="text-[10px] font-bold">הזן קוד</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xl font-black text-slate-800 italic">היסטוריה</h3>
        <button onClick={handleExport} className="text-[10px] text-slate-400 font-bold hover:text-indigo-600">ייצוא JSON</button>
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-4 p-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-slate-300 pt-10 text-sm">אין הודעות בהיסטוריה</div>
        ) : (
          history.map(item => (
            <div key={item.timestamp} className="border border-slate-100 rounded-[1.8rem] p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[9px] text-slate-400 font-black mb-2 uppercase">
                  {new Date(item.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
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
