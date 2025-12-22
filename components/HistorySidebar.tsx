
import React from 'react';
import { HistoryItem } from '../types';
import SharedPreview from './SharedPreview';

interface HistorySidebarProps {
  history: HistoryItem[];
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  username?: string;
  avatar?: string;
}

const HistorySidebar = ({ history, syncStatus, username, avatar }: HistorySidebarProps) => {
  return (
    <aside className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] p-5 shadow-2xl shadow-slate-200/50 flex flex-col h-full max-h-[calc(100vh-10rem)] border border-white overflow-hidden">
      
      {/* User Info Card - RTL Optimized */}
      <div className="mb-6 p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Text Section */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                syncStatus === 'syncing' ? 'bg-amber-300 animate-pulse' : 'bg-green-400'
              }`} />
              <h4 className="text-[9px] font-black uppercase tracking-wider opacity-70 whitespace-nowrap">מסונכרן לענן</h4>
            </div>
            <p className="text-lg font-bold truncate leading-tight tracking-tight">
              {username || 'משתמש אורח'}
            </p>
          </div>

          {/* Avatar Section */}
          <div className="flex-shrink-0">
            {avatar ? (
              <img src={avatar} className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-lg object-cover" alt="User" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-xl font-black">
                {username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative background icon */}
        <div className="absolute -left-4 -bottom-4 opacity-10 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3v12m0 0h6m-6 0H6" />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 px-3">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">היסטוריה</h3>
        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">
          {history.length} פריטים
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-4 p-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-slate-400 pt-16 px-4">
            <div className="bg-slate-50 w-20 h-20 rounded-[2rem] mx-auto grid place-content-center mb-6 shadow-inner border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="font-bold">אין היסטוריה עדיין</p>
            <p className="text-xs opacity-60 mt-2 leading-relaxed">ההודעות והסקרים שתשלחו יופיעו כאן וישמרו בענן שלכם.</p>
          </div>
        ) : (
          history.map(item => (
            <div key={item.timestamp} className="history-item border border-slate-50 rounded-[1.5rem] p-4 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all bg-white/50 hover:bg-white group">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  {new Date(item.timestamp).toLocaleString('he-IL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </div>
              </div>
              <div className="bg-slate-50/50 rounded-2xl p-2.5 border border-slate-100 group-hover:bg-white transition-colors overflow-hidden">
                <SharedPreview payload={item.payload} />
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;
