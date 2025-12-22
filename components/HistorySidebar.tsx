
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
  onManualSync: () => void;
}

const HistorySidebar = ({ history, syncStatus, username, avatar, savedWebhooks = [], cloudId, onLogout, onImport, onSetCloudId, onResetCloud, onManualSync }: HistorySidebarProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
            <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'success' ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]' : 'bg-amber-400 animate-pulse'}`} />
                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">
                  {syncStatus === 'success' ? 'מגובה אוטומטית' : 'עבודה מקומית'}
                </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <button 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors text-center block w-full"
        >
            {showAdvanced ? 'הסתר הגדרות' : 'הגדרות סנכרון ידניות'}
        </button>
        
        {syncStatus !== 'success' && (
            <button 
                onClick={onManualSync}
                className="text-[9px] font-bold text-indigo-500 bg-indigo-50 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                נסה לחבר ענן כעת
            </button>
        )}
      </div>

      {/* Advanced Cloud Management */}
      {showAdvanced && (
        <div className="mb-6 space-y-3 animate-in slide-in-from-top-2 duration-300 p-4 bg-slate-50 rounded-[1.8rem] border border-slate-100">
            <div className="text-[10px] font-bold text-slate-500 mb-2 text-right">מזהה ענן נוכחי:</div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px] font-mono truncate text-indigo-600 mb-4 text-center">{cloudId || 'לא נוצר עדיין'}</div>
            
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => {
                        const id = prompt('הכנס מפתח ענן ידני:');
                        if (id) onSetCloudId(id);
                    }}
                    className="py-2 bg-white text-indigo-600 rounded-lg text-[9px] font-black border border-indigo-100 hover:bg-indigo-50"
                >
                    ייבוא ידני
                </button>
                <button 
                    onClick={() => { if(confirm('לאפס חיבור ענן?')) onResetCloud(); }}
                    className="py-2 bg-white text-red-500 rounded-lg text-[9px] font-black border border-red-100 hover:bg-red-50"
                >
                    ניתוק מזהה
                </button>
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
                <div className="text-[9px] font-bold text-slate-400 truncate px-2 text-right">
                    יעד: <span className="text-indigo-600 font-black">{item.webhookName || 'כללי'}</span>
                </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;
