
import React, { useState, useEffect, useCallback } from 'react';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';

type ActiveApp = 'chatSender' | 'otherApp';

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('chatHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  const saveHistory = useCallback((payloadToSave: ChatMessagePayload) => {
    setHistory(prevHistory => {
      const newItem: HistoryItem = { timestamp: Date.now(), payload: payloadToSave };
      const updatedHistory = [newItem, ...prevHistory].slice(0, 50);
      try {
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      return updatedHistory;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-10 box-border bg-[#f8fafc] font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <header className="w-full max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-indigo-600 rounded-2xl">
               <img src="https://raw.githubusercontent.com/shey3132/-22/main/%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%20%D7%93%D7%99%D7%92%D7%99%D7%98%D7%9C%D7%99%20%D7%A2%D7%9D%20%D7%A8%D7%A9%D7%AA%20%D7%A4%D7%A2%D7%95%D7%9C%D7%94.png" alt="Logo" className="w-10 h-10 object-contain brightness-0 invert" />
             </div>
             <div>
               <h1 className="text-2xl font-black text-slate-900 leading-none">ChatHub</h1>
               <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">משגר הודעות חכם</p>
             </div>
          </div>

          <nav className="flex items-center justify-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>
              🚀 שליחת הודעות
            </TabButton>
            <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>
              📊 יצירת סקרים
            </TabButton>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
        <div className="lg:col-span-8">
            {activeApp === 'chatSender' && <GoogleChatSender saveHistory={saveHistory} />}
            {activeApp === 'otherApp' && <OtherApp saveHistory={saveHistory} />}
        </div>
        <div className="lg:col-span-4">
          <HistorySidebar history={history} />
        </div>
      </main>
      
      <footer className="mt-16 text-center py-10 border-t border-slate-200 max-w-4xl mx-auto">
        <p className="text-slate-400 text-sm">© {new Date().getFullYear()} • ChatHub Studio</p>
      </footer>
    </div>
  );
}
