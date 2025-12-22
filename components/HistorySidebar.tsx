
import React, { useState } from 'react';
import { HistoryItem, SavedWebhook, UserDataContainer } from '../types';
import SharedPreview from './SharedPreview';

interface HistorySidebarProps {
  history: HistoryItem[];
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  username?: string;
  avatar?: string;
  savedWebhooks?: SavedWebhook[];
  cloudId: string | null;
  onLogout: () => void;
  onImport: (data: UserDataContainer) => void;
  onSetCloudId: (id: string) => void;
}

const HistorySidebar = ({ history, syncStatus, username, avatar, savedWebhooks = [], cloudId, onLogout, onImport, onSetCloudId }: HistorySidebarProps) => {
  const [isCloudOpen, setIsCloudOpen] = useState(false);

  const generateSyncCode = () => {
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    try {
        return btoa(encodeURIComponent(JSON.stringify(data)));
    } catch (e) { return ""; }
  };

  const handlePasteSyncCode = () => {
    const code = prompt('הדבק כאן את קוד הסנכרון מהמחשב השני:');
    if (!code) return;
    try {
      const decoded = decodeURIComponent(atob(code));
      const data = JSON.parse(decoded);
      if (confirm('לייבא נתונים? המידע הקיים יוחלף.')) onImport(data);
    } catch (e) { alert('קוד לא תקין'); }
  };

  return (
    <aside className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 flex flex-col h-full max-h-[calc(100vh-10rem)] border border-white overflow-hidden">
      
      {/* User Status Card */}
      <div className="mb-6 p-5 bg-indigo-600 rounded-[2.2rem] text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={onLogout} className="order-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
          <div className="flex-shrink-0 order-2">
            {avatar ? <img src={avatar} className="w-12 h-12 rounded-2xl border-2 border-white/30 object-cover" /> : <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">{username?.charAt(0) || '?'}</div>}
          </div>
          <div className="flex-1 text-right order-1 px-3">
            <h4 className="text-lg font-bold truncate">{username || 'אורח'}</h4>
            <button onClick={() => setIsCloudOpen(!isCloudOpen)} className="flex items-center gap-1.5 justify-start group/btn">
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'success' ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest group-hover/btn:underline">
                {syncStatus === 'success' ? 'ענן מחובר' : 'ממתין לסנכרון'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Management (NetFree Friendly) */}
      {isCloudOpen && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-[1.8rem] border border-indigo-100 animate-in slide-in-from-top-2 duration-200">
            <h5 className="text-[10px] font-black text-indigo-400 uppercase mb-3">ניהול סנכרון ענן</h5>
            <div className="space-y-3">
                <div>
                    <label className="text-[9px] font-bold text-indigo-900 block mb-1 px-1">מזהה הענן שלך (לשמירה):</label>
                    <div className="flex gap-2">
                        <input 
                            readOnly 
                            value={cloudId || 'מייצר מזהה...'} 
                            className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-mono text-indigo-600 overflow-hidden" 
                        />
                        <button 
                            onClick={() => { if(cloudId) { navigator.clipboard.writeText(cloudId); alert('המזהה הועתק!'); }}}
                            className="bg-white p-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012-2" /></svg>
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        const id = prompt('הכנס מזהה ענן ממחשב אחר:');
                        if (id) onSetCloudId(id);
                    }}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-100"
                >
                    התחבר למזהה קיים
                </button>
            </div>
        </div>
      )}

      {/* Manual Sync (Bypasses everything) */}
      <div className="bg-slate-50 rounded-[1.8rem] p-4 mb-6 border border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block mb-3 text-center italic">סנכרון ידני (חסין נטפרי 100%)</span>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => { navigator.clipboard.writeText(generateSyncCode()); alert('קוד סנכרון מלא הועתק!'); }}
            className="flex flex-col items-center gap-1 py-3 bg-white hover:bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <span className="text-[10px] font-bold">העתק קוד</span>
          </button>
          <button 
            onClick={handlePasteSyncCode}
            className="flex flex-col items-center gap-1 py-3 bg-white hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
            <span className="text-[10px] font-bold">הדבק קוד</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xl font-black text-slate-800 italic tracking-tight">היסטוריה</h3>
        <div className="w-8 h-1 bg-slate-100 rounded-full" />
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-4 p-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-slate-300 pt-10 text-sm italic">ההיסטוריה שלך תופיע כאן</div>
        ) : (
          history.map(item => (
            <div key={item.timestamp} className="border border-slate-100 rounded-[1.8rem] p-4 bg-white shadow-sm hover:shadow-md transition-all group">
                <div className="text-[9px] text-slate-400 font-black mb-2 uppercase flex justify-between">
                  <span>{new Date(item.timestamp).toLocaleTimeString('he-IL')}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">#{history.indexOf(item) + 1}</span>
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
