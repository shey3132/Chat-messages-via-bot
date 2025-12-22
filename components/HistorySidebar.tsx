
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
  onResetCloud: () => void;
}

const HistorySidebar = ({ history, syncStatus, username, avatar, savedWebhooks = [], cloudId, onLogout, onImport, onSetCloudId, onResetCloud }: HistorySidebarProps) => {
  const [isCloudOpen, setIsCloudOpen] = useState(!cloudId);

  const generateSyncCode = () => {
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    try {
        return btoa(encodeURIComponent(JSON.stringify(data)));
    } catch (e) { return ""; }
  };

  return (
    <aside className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 flex flex-col h-full max-h-[calc(100vh-10rem)] border border-white overflow-hidden">
      
      {/* User Card */}
      <div className="mb-6 p-5 bg-indigo-600 rounded-[2.2rem] text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={onLogout} className="order-3 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="התנתק">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
          <div className="flex-shrink-0 order-2">
            {avatar ? <img src={avatar} className="w-12 h-12 rounded-2xl border-2 border-white/30 object-cover" /> : <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">{username?.charAt(0) || '?'}</div>}
          </div>
          <div className="flex-1 text-right order-1 px-3">
            <h4 className="text-lg font-bold truncate leading-tight">{username || 'אורח'}</h4>
            <button onClick={() => setIsCloudOpen(!isCloudOpen)} className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'success' ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
              <p className="text-[10px] font-black opacity-80 uppercase tracking-widest hover:underline">
                {syncStatus === 'success' ? 'סנכרון פעיל' : 'הגדרת ענן'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Management Area */}
      {isCloudOpen && (
        <div className="mb-6 space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl">
                <h5 className="text-[10px] font-black text-indigo-400 uppercase mb-3 text-center tracking-widest italic">מפתח ענן (סנכרון אוטומטי)</h5>
                
                {!cloudId ? (
                    <div className="space-y-3">
                        <p className="text-[10px] leading-relaxed opacity-60 text-center">כדי לסנכרן אוטומטית בין מחשבים, שלח הודעה ראשונה או הזן מפתח ממחשב אחר.</p>
                        <button 
                            onClick={() => {
                                const id = prompt('הכנס מפתח ענן (למשל: abc123def):');
                                if (id) {
                                    if (id.length > 30) alert('נראה שהכנסת קוד גיבוי במקום מפתח ענן. נא להכניס את המפתח הקצר.');
                                    else onSetCloudId(id.trim());
                                }
                            }}
                            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black hover:bg-indigo-700 transition-all shadow-lg"
                        >
                            הזן מפתח קיים
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-indigo-300">{cloudId}</span>
                            <button onClick={() => { navigator.clipboard.writeText(cloudId); alert('המפתח הועתק!'); }} className="text-[9px] bg-white/10 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors">העתק</button>
                        </div>
                        <button 
                            onClick={() => { if(confirm('האם לאפס את חיבור הענן? המידע יישאר מקומי.')) onResetCloud(); }}
                            className="w-full py-2 border border-red-500/30 text-red-400 rounded-xl text-[9px] font-black hover:bg-red-500 hover:text-white transition-all"
                        >
                            אפס חיבור ענן
                        </button>
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-[1.8rem]">
                <span className="text-[9px] font-black text-indigo-400 uppercase block mb-2 text-center">גיבוי ידני בקוד</span>
                <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(generateSyncCode()); alert('קוד גיבוי מלא הועתק!'); }} className="flex-1 py-2 bg-white text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 shadow-sm">העתק קוד</button>
                    <button onClick={() => {
                        const code = prompt('הדבק קוד גיבוי:');
                        if (code) {
                            try {
                                const decoded = JSON.parse(decodeURIComponent(atob(code)));
                                onImport(decoded);
                            } catch(e) { alert('קוד לא תקין'); }
                        }
                    }} className="flex-1 py-2 bg-white text-slate-500 rounded-lg text-[10px] font-bold border border-slate-200 shadow-sm">ייבוא קוד</button>
                </div>
            </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xl font-black text-slate-800 italic tracking-tight">היסטוריה</h3>
        <div className="h-1 w-8 bg-indigo-500 rounded-full" />
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-4 p-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-slate-300 pt-10 text-sm italic">אין הודעות בהיסטוריה</div>
        ) : (
          history.map(item => (
            <div key={item.timestamp} className="border border-slate-100 rounded-[1.8rem] p-4 bg-white shadow-sm hover:shadow-md transition-all group relative">
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
