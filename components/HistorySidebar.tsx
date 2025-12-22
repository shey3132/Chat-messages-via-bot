
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
    <aside className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 flex flex-col h-full max-h-[calc(100vh-10rem)] border border-white overflow-hidden">
      
      {/* User Info Card - Improved RTL & Unicode Support */}
      <div className="mb-8 p-5 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          
          {/* Avatar Section - Left side in RTL */}
          <div className="flex-shrink-0 order-2">
            {avatar ? (
              <img src={avatar} className="w-14 h-14 rounded-2xl border-2 border-white/30 shadow-md object-cover transition-transform group-hover:scale-105" alt="User" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black">
                {username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Text Section - Right side in RTL */}
          <div className="flex-1 min-w-0 text-right order-1 px-1">
            <h4 className="text-xl font-bold truncate mb-1" style={{ fontFamily: 'Assistant, sans-serif' }}>
              {username || 'משתמש אורח'}
            </h4>
            <div className="flex items-center gap-1.5 justify-start">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'
              }`} />
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-wide truncate">מסונכרן לכל המכשירים</p>
            </div>
          </div>
          
        </div>
        
        {/* Decorative background element */}
        <div className="absolute left-0 bottom-0 translate-y-1/2 -translate-x-1/4 opacity-10 group-hover:scale-110 transition-transform duration-700">
           <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">היסטוריה</h3>
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
        </div>
        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200">
          {history.length} / 50
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-4 p-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-slate-400 pt-20 px-4">
            <div className="bg-slate-50 w-20 h-20 rounded-[2rem] mx-auto grid place-content-center mb-6 shadow-inner border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="font-bold text-slate-600">אין הודעות בהיסטוריה</p>
            <p className="text-xs opacity-60 mt-2 leading-relaxed max-w-[200px] mx-auto">כאן יופיעו ההודעות האחרונות ששלחתם ויהיו זמינות מכל מכשיר.</p>
          </div>
        ) : (
          history.map(item => (
            <div key={item.timestamp} className="history-item border border-slate-100 rounded-[1.8rem] p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all bg-white hover:bg-slate-50 group cursor-default">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                  {new Date(item.timestamp).toLocaleString('he-IL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/50 group-hover:bg-white transition-colors overflow-hidden">
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
