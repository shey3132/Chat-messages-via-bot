
import React from 'react';
import { HistoryItem } from '../types';
import SharedPreview from './SharedPreview';

interface HistorySidebarProps {
  history: HistoryItem[];
  syncStatus: any;
  username?: string;
  avatar?: string;
  savedWebhooks?: any;
  cloudId: string | null;
  onLogout: () => void;
  onImportFile: any;
  onExportFile: any;
  onSetCloudId: any;
  onResetCloud: any;
  onManualSync: any;
}

const HistorySidebar = ({ history }: HistorySidebarProps) => {
  return (
    <aside className="bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-8 shadow-2xl border border-white/10 h-full flex flex-col overflow-hidden">
      
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex flex-col">
           <h3 className="text-3xl font-black text-white tracking-tighter italic font-outfit">Feed</h3>
           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">{history.length} Recent broadcasts</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 shadow-inner">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 pl-4 space-y-8">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <span className="text-sm font-black text-slate-700 uppercase tracking-widest italic">No activity yet</span>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={item.timestamp} className="relative pr-8 border-r-2 border-white/5 group pb-4 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Timeline Dot with Glow */}
                <div className="absolute -right-[11px] top-1 w-5 h-5 rounded-full bg-slate-900 border-4 border-slate-800 shadow-[0_0_15px_rgba(79,70,229,0)] transition-all group-hover:border-indigo-600 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] group-hover:scale-125" />
                
                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-slate-600">{new Date(item.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">{item.webhookName || 'Global Webhook'}</span>
                   </div>
                   
                   <div className="bg-slate-900 rounded-[2rem] border border-white/5 p-5 shadow-2xl group-hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="max-h-48 overflow-hidden relative rounded-xl after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-t after:from-slate-900/60 after:to-transparent">
                         <SharedPreview payload={item.payload} />
                      </div>
                      <div className="mt-4 flex justify-end">
                         <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">View details</div>
                      </div>
                   </div>
                </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4 text-center">
         <p className="text-[9px] text-slate-600 font-bold leading-relaxed uppercase tracking-widest">
           סנכרון מקומי פועל. המידע נשמר על דפדפן זה.<br/>
           <span className="text-indigo-500 opacity-60">ChatHub v36 • Midnight Bloom</span>
         </p>
      </div>
    </aside>
  );
};

export default HistorySidebar;
