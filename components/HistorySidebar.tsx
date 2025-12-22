
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
  const [isCloudOpen, setIsCloudOpen] = useState(!cloudId); // נפתח אוטומטית אם אין מפתח

  const generateSyncCode = () => {
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    try {
        return btoa(encodeURIComponent(JSON.stringify(data)));
    } catch (e) { return ""; }
  };

  return (
    <aside className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 flex flex-col h-full max-h-[calc(100vh-10rem)] border border-white overflow-hidden">
      
      {/* User Info */}
      <div className="mb-6 p-5 bg-indigo-600 rounded-[2.2rem] text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={onLogout} className="order-3 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
          <div className="flex-shrink-0 order-2">
            {avatar ? <img src={avatar} className="w-12 h-12 rounded-2xl border-2 border-white/30 object-cover" /> : <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">{username?.charAt(0) || '?'}</div>}
          </div>
          <div className="flex-1 text-right order-1 px-3">
            <h4 className="text-lg font-bold truncate leading-tight">{username || 'אורח'}</h4>
            <button onClick={() => setIsCloudOpen(!isCloudOpen)} className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'success' ? 'bg-green-400' : 'bg-amber-400'}`} />
              <p className="text-[10px] font-black opacity-80 uppercase tracking-widest hover:underline">
                {syncStatus === 'success' ? 'סנכרון פעיל' : 'הגדרת ענן'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Setup (The "One-Time" step for NetFree) */}
      {isCloudOpen && (
        <div className="mb-6 p-5 bg-slate-900 rounded-[2rem] text-white animate-in zoom-in duration-300 shadow-2xl shadow-indigo-200/20">
            <h5 className="text-[11px] font-black text-indigo-400 uppercase mb-3 text-center tracking-widest italic">סנכרון ענן (נטפרי)</h5>
            
            {!cloudId ? (
                <div className="space-y-4">
                    <p className="text-[11px] leading-relaxed opacity-70 text-center">כדי שהמידע יישאב אוטומטית במחשב אחר, שלח הודעה ראשונה או הזן מפתח קיים.</p>
                    <button 
                        onClick={() => {
                            const id = prompt('הכנס מפתח ענן ממחשב אחר:');
                            if (id && id.length > 5) onSetCloudId(id);
                        }}
                        className="w-full py-3 bg-white text-slate-900 rounded-2xl text-xs font-black shadow-lg hover:scale-[1.02] transition-all"
                    >
                        יש לי מפתח קיים
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <label className="text-[9px] font-black opacity-50 block mb-1">מפתח הענן שלך:</label>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-indigo-300">{cloudId}</span>
                            <button onClick={() => { navigator.clipboard.writeText(cloudId); alert('המפתח הועתק!'); }} className="text-[10px] bg-white/10 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors">העתק</button>
                        </div>
                    </div>
                    <p className="text-[9px] opacity-40 text-center italic">הזן את המפתח הזה פעם אחת במחשב השני והכל יסתנכרן לבד.</p>
                </div>
            )}
        </div>
      )}

      {/* Manual Code Sync */}
      <div className="bg-slate-50 rounded-[2rem] p-4 mb-6 border border-slate-100 flex items-center justify-around gap-2">
          <button 
            onClick={() => { navigator.clipboard.writeText(generateSyncCode()); alert('קוד גיבוי מלא הועתק!'); }}
            className="flex-1 flex flex-col items-center gap-1 py-2 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all hover:border-indigo-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <span className="text-[9px] font-black uppercase">קוד ידני</span>
          </button>
          <div className="w-px h-6 bg-slate-200" />
          <button 
            onClick={() => {
                const code = prompt('הדבק קוד סנכרון:');
                if (code) {
                    try {
                        const decoded = JSON.parse(decodeURIComponent(atob(code)));
                        onImport(decoded);
                    } catch(e) { alert('קוד שגוי'); }
                }
            }}
            className="flex-1 flex flex-col items-center gap-1 py-2 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all hover:border-indigo-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span className="text-[9px] font-black uppercase">ייבוא קוד</span>
          </button>
      </div>

      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xl font-black text-slate-800 italic tracking-tight">היסטוריה</h3>
        <div className="h-1 w-8 bg-indigo-500 rounded-full" />
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-4 p-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-slate-300 pt-10 text-sm italic">ריק כאן... שלח משהו!</div>
        ) : (
          history.map(item => (
            <div key={item.timestamp} className="border border-slate-100 rounded-[1.8rem] p-4 bg-white shadow-sm hover:shadow-md transition-all group">
                <div className="text-[9px] text-slate-400 font-black mb-2 uppercase flex justify-between">
                  <span>{new Date(item.timestamp).toLocaleTimeString('he-IL')}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono">#{history.length - history.indexOf(item)}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/50 mb-3 overflow-hidden">
                  <SharedPreview payload={item.payload} />
                </div>
                <div className="text-[9px] font-bold text-slate-400 truncate px-2">
                    אל: <span className="text-indigo-600 font-black">{item.webhookName || 'יעד כללי'}</span>
                </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;
