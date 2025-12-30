
import React from 'react';
import { HistoryItem } from '../types';
import SharedPreview from './SharedPreview';

interface HistorySidebarProps {
  history: HistoryItem[];
}

const HistorySidebar = ({ history }: HistorySidebarProps) => {
  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">פעילות אחרונה</h3>
        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{history.length} שידורים בוצעו</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
             <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">אין שידורים קודמים</span>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={item.timestamp} className="relative pl-6 border-l border-slate-100 group animate-slide" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-white border-2 border-slate-200 group-hover:border-indigo-500 transition-colors" />
                
                <div className="flex flex-col gap-2">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-400">{new Date(item.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{item.webhookName || 'שידור'}</span>
                   </div>
                   
                   <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-white hover:border-indigo-200 transition-all cursor-default">
                      <div className="max-h-32 overflow-hidden relative">
                         <SharedPreview payload={item.payload} />
                      </div>
                   </div>
                </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">ChatHub v46 • Refined Edition</span>
      </div>
    </div>
  );
};

export default HistorySidebar;
