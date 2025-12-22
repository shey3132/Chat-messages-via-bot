
import React, { useState, useEffect, useCallback } from 'react';
import { inject } from '@vercel/analytics';
import GoogleChatSender from './views/GoogleChatSender';
import OtherApp from './views/OtherApp';
import { HistoryItem, ChatMessagePayload, SavedWebhook, UserDataContainer } from './types';
import TabButton from './components/TabButton';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';

type ActiveApp = 'chatSender' | 'otherApp';

const SYNC_PROVIDER_URL = 'https://kvdb.io/6E3tYfN1Yx6878YpXy6L5z/'; 

export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>('chatSender');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [user, setUser] = useState<{username: string, syncKey: string, avatar?: string} | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');

  // אתחול האנליטיקה של Vercel בצורה בטוחה
  useEffect(() => {
    try {
      inject();
    } catch (e) {
      console.warn('Analytics injection failed', e);
    }
  }, []);

  const pushToCloud = useCallback(async (key: string, data: UserDataContainer) => {
    if (!key) return;
    try {
      await fetch(`${SYNC_PROVIDER_URL}${key}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err) {}
  }, []);

  const pullFromCloud = useCallback(async (key: string) => {
    if (!key) return;
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${SYNC_PROVIDER_URL}${key}`);
      if (response.ok) {
        const remoteData = await response.json();
        
        let cloudHistory: HistoryItem[] = [];
        let cloudWebhooks: SavedWebhook[] = [];

        if (Array.isArray(remoteData)) {
          cloudHistory = remoteData;
        } else if (remoteData && typeof remoteData === 'object') {
          cloudHistory = remoteData.history || [];
          cloudWebhooks = remoteData.webhooks || [];
        }

        setHistory(prev => {
          const combined = [...prev, ...cloudHistory];
          const unique = Array.from(new Map(combined.map(item => [item.timestamp, item])).values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);
          localStorage.setItem('chatHistory', JSON.stringify(unique));
          return unique;
        });

        setSavedWebhooks(prev => {
            const combined = [...prev, ...cloudWebhooks];
            const unique = Array.from(new Map(combined.map(item => [item.url, item])).values());
            localStorage.setItem('savedWebhooks', JSON.stringify(unique));
            return unique;
        });

        setSyncStatus('success');
      } else {
        setSyncStatus('idle');
      }
    } catch (err) {
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('chathub_user');
    const storedHistory = localStorage.getItem('chatHistory');
    const storedWebhooks = localStorage.getItem('savedWebhooks');

    if (storedHistory) setHistory(JSON.parse(storedHistory));
    if (storedWebhooks) setSavedWebhooks(JSON.parse(storedWebhooks));

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      pullFromCloud(parsedUser.syncKey);
    } else {
      setIsAuthOpen(true);
    }
  }, [pullFromCloud]);

  const saveHistory = useCallback((payloadToSave: ChatMessagePayload) => {
    setHistory(prevHistory => {
      const newItem: HistoryItem = { timestamp: Date.now(), payload: payloadToSave };
      const updatedHistory = [newItem, ...prevHistory].slice(0, 50);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      
      if (user?.syncKey) {
        pushToCloud(user.syncKey, { history: updatedHistory, webhooks: savedWebhooks });
      }
      
      return updatedHistory;
    });
  }, [user, savedWebhooks, pushToCloud]);

  const addWebhook = useCallback((webhook: SavedWebhook) => {
    setSavedWebhooks(prev => {
        const filtered = prev.filter(w => w.url !== webhook.url);
        const updated = [webhook, ...filtered];
        localStorage.setItem('savedWebhooks', JSON.stringify(updated));
        if (user?.syncKey) {
            pushToCloud(user.syncKey, { history, webhooks: updated });
        }
        return updated;
    });
  }, [user, history, pushToCloud]);

  const deleteWebhook = useCallback((id: string) => {
    setSavedWebhooks(prev => {
        const updated = prev.filter(w => w.id !== id);
        localStorage.setItem('savedWebhooks', JSON.stringify(updated));
        if (user?.syncKey) {
            pushToCloud(user.syncKey, { history, webhooks: updated });
        }
        return updated;
    });
  }, [user, history, pushToCloud]);

  const handleLogin = (username: string, syncKey: string, avatar?: string) => {
    const userData = { username, syncKey, avatar };
    setUser(userData);
    localStorage.setItem('chathub_user', JSON.stringify(userData));
    setIsAuthOpen(false);
    pullFromCloud(syncKey);
  };

  const handleLogout = () => {
    if(confirm('בטוח שברצונך להתנתק?')) {
      localStorage.removeItem('chathub_user');
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('savedWebhooks');
      setUser(null);
      setHistory([]);
      setSavedWebhooks([]);
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-10 box-border bg-[#f8fafc] font-sans">
      {isAuthOpen && <AuthModal onLogin={handleLogin} />}
      
      <header className="w-full max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white