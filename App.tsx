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
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 box-border">
      <header className="w-full max-w-lg mx-auto mb-6">
        <nav className="flex items-center justify-center p-1.5 bg-slate-200/70 rounded-xl backdrop-blur-sm shadow-inner">
          <TabButton isActive={activeApp === 'chatSender'} onClick={() => setActiveApp('chatSender')}>
            🚀 משגר הודעות ל-Chat
          </TabButton>
          <TabButton isActive={activeApp === 'otherApp'} onClick={() => setActiveApp('otherApp')}>
            📊 מחולל סקרים
          </TabButton>
        </nav>
      </header>
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
            {activeApp === 'chatSender' && <GoogleChatSender saveHistory={saveHistory} />}
            {activeApp === 'otherApp' && <OtherApp saveHistory={saveHistory} />}
        </div>
        <HistorySidebar history={history} />
      </main>
    </div>
  );
}