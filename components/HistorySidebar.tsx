
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
    <aside className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] p-8 shadow-2xl shadow-indigo-100/30 border border-white h-full flex flex-col overflow-hidden">
      
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex flex-col">
           <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic font-rubik">פעילות אחרונה</h3>
           <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1">{history.length} שידורים בוצעו</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/30 flex items-center justify-center text-indigo-500 shadow-sm backdrop-blur-md">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 pl-4 space-y-10">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-24 h-24 bg-slate-50/50 rounded-full flex items-center justify-center mb-6 border border-white shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <span className="text-sm font-black text-slate-400 uppercase tracking-widest italic">ציר הזמן ריק</span>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={item.timestamp} className="relative pr-8 border-r-2 border-indigo-100 group pb-6 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Timeline Dot */}
                <div className="absolute -right-[11px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 shadow-lg shadow-indigo-100 transition-all group-hover:bg-indigo-600 group-hover:scale-125 group-hover:border-white" />
                
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-slate-400">{new Date(item.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 font-black shadow-sm">{item.webhookName || 'שידור כללי'}</span>
                   </div>
                   
                   <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-xl shadow-indigo-100/20 group-hover:border-indigo-300 group-hover:shadow-indigo-200 transition-all duration-300 hover:scale-[1.03] cursor-pointer relative overflow-hidden">
                      <div className="max-h-56 overflow-hidden relative rounded-2xl after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-t after:from-white/60 after:to-transparent">
                         <SharedPreview payload={item.payload} />
                      </div>
                      <div className="mt-5 flex justify-end">
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">פרטי ההודעה</div>
                      </div>
                   </div>
                </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4 text-center">
         <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-[0.2em]">
           הנתונים נשמרים מקומית על המחשב שלך.<br/>
           <span className="text-indigo-600 opacity-70 font-black">ChatHub v40 • Crystal Edition</span>
         </p>
      </div>
    </aside>
  );
};

export default HistorySidebar;
