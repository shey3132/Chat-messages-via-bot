import React from 'react';
import { HistoryItem } from '../types';
import SharedPreview from './SharedPreview';

const HistorySidebar = ({ history }: { history: HistoryItem[] }) => (
  <aside className="bg-white/70 backdrop-blur-lg rounded-2xl p-4 shadow-2xl shadow-slate-200/50 flex flex-col max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-11rem)] lg:max-h-[calc(100vh-12rem)]">
    <h3 className="text-xl font-bold text-slate-800 p-2 text-center flex-shrink-0">היסטורית שליחות</h3>
    <div className="overflow-y-auto flex-1 mt-2 space-y-3 p-1">
      {history.length === 0 ? (
        <div className="text-center text-slate-500 pt-10">
          <div className="bg-slate-100 w-16 h-16 rounded-full mx-auto grid place-content-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          אין היסטוריה עדיין.
        </div>
      ) : (
        history.map(item => (
          <div key={item.timestamp} className="history-item border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow bg-white/50">
            <div className="text-xs text-slate-500 font-medium mb-2">{new Date(item.timestamp).toLocaleString('he-IL')}</div>
            <div className="bg-slate-50/50 rounded-lg p-2">
              <SharedPreview payload={item.payload} />
            </div>
          </div>
        ))
      )}
    </div>
  </aside>
);

export default HistorySidebar;
