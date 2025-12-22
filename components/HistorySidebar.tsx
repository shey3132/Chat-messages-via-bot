
import React from 'react';
import { HistoryItem, SavedWebhook, UserDataContainer } from '../types';
import SharedPreview from './SharedPreview';

interface HistorySidebarProps {
  history: HistoryItem[];
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  username?: string;
  avatar?: string;
  savedWebhooks?: SavedWebhook[];
  onLogout: () => void;
  onImport: (data: UserDataContainer) => void;
}

const HistorySidebar = ({ history, syncStatus, username, avatar, savedWebhooks = [], onLogout, onImport }: HistorySidebarProps) => {
  
  const handleExport = () => {
    const data: UserDataContainer = { history, webhooks: savedWebhooks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chathub_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const data = JSON.parse(re.target?.result as string);
          if (confirm('האם לייבא את הנתונים? פעולה זו תחליף את המידע הקיים.')) {
            onImport(data);
          }
        } catch (err) {
          alert('קובץ לא תקין');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <aside className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 flex flex-col h-full max-h-[calc(100vh-10rem)] border border-white overflow-hidden">
      
      {/* User Info Card */}
      <div className="mb-6 p-5 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          
          {/* Logout Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onLogout(); }}
            className="order-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 flex items-center justify-center group/logout active:scale-95"
            title="התנתק"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="flex-shrink-0 order-2">
            {avatar ? (
              <img src={avatar} className="w-12 h-12 rounded-2xl border-2 border-white/30 shadow-md object-cover" alt="User" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black">
                {username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-right order-1 px-3">
            <h4 className="text-lg font-bold truncate mb-0.5">{username || 'אורח'}</h4>
            <div className="flex items-center gap-1.5 justify-start">
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : syncStatus === 'error' ? 'bg-slate-400' : 'bg-green-400'}`} />
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-wide truncate">
                {syncStatus === 'error' ? 'מצב מקומי' : 'סנכרון פעיל'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Actions */}
      <div className="flex gap-2 mb-6">
        <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-bold transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          ייצוא גיבוי
        </button>
        <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-bold transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          ייבוא גיבוי
        </button>
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-800">היסטוריה</h3>
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
        </div>
        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200">
          {history.length} / 50
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1 space-y-4 p-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-slate-400 pt-20 px-4">
            <p className="font-bold text-slate-600">אין הודעות בהיסטוריה</p>
          </div>
        ) : (
          history.map(item => {
            const targetWebhook = savedWebhooks.find(w => w.url === item.webhookUrl);
            const targetName = targetWebhook?.name || item.webhookName || 'יעד כללי';
            return (
              <div key={item.timestamp} className="history-item border border-slate-100 rounded-[1.8rem] p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all bg-white group">
                <div className="text-[9px] text-slate-400 font-black mb-2 uppercase">
                  {new Date(item.timestamp).toLocaleString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/50 mb-3 overflow-hidden">
                  <SharedPreview payload={item.payload} />
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <span className="text-[9px] font-bold text-slate-500 truncate">
                        אל: <span className="text-indigo-600 font-black">{targetName}</span>
                    </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;
