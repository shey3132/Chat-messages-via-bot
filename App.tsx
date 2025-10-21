import React, { useState, useEffect, useCallback } from 'react';
import GoogleChatSender from './GoogleChatSender';
import OtherApp from './OtherApp';
import { HistoryItem, ChatMessagePayload, CardV2 } from './types';

type ActiveApp = 'chatSender' | 'otherApp';

const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-bold transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg
      ${isActive
        ? 'bg-white text-indigo-700 shadow-md'
        : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
      }`}
  >
    {children}
  </button>
);

const SharedPreview: React.FC<{ payload: ChatMessagePayload }> = ({ payload }) => {
  if (!payload) return null;

  if (payload.text) {
    return <div className="whitespace-pre-wrap p-4 text-sm">{payload.text}</div>;
  }

  if (payload.cards) {
    return (
      <div className="flex flex-col gap-2">
        {payload.cards.map((card, cardIndex) => (
          <div key={cardIndex} className="preview-card border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm w-full text-sm">
            {card.header && (
              <div className="card-header p-2">
                {card.header.title && <strong className="font-semibold block text-slate-900">{card.header.title}</strong>}
                {card.header.subtitle && <span className="text-xs text-slate-500 block">{card.header.subtitle}</span>}
                {card.header.imageUrl && <img src={card.header.imageUrl} alt="Header" className="w-full rounded-md mt-2" />}
              </div>
            )}
            {card.sections?.map((section, secIndex) => (
              <div key={secIndex} className="section border-t border-slate-200 p-2 flex flex-col gap-2">
                {section.widgets.map((widget, widIndex) => (
                  <div key={widIndex}>
                    {widget.textParagraph && <p className="text-slate-700 leading-normal whitespace-pre-wrap text-sm">{widget.textParagraph.text}</p>}
                    {widget.image && <img src={widget.image.imageUrl} alt="Card content" className="max-w-full rounded-md" />}
                    {widget.buttonList?.buttons.map((btn, btnIndex) => (
                      <a key={btnIndex} href={btn.textButton.onClick.openLink.url} target="_blank" rel="noopener noreferrer" className="action-button inline-block mt-1 px-2 py-1 rounded-md bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors">
                        {btn.textButton.text}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (payload.cardsV2) {
      return (
          <div className="flex flex-col gap-2">
              {payload.cardsV2.map((cardV2Item: CardV2, index: number) => (
                  <div key={index} className="preview-card border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm w-full text-sm">
                      {cardV2Item.card.header && (
                          <div className="card-header p-2">
                              {cardV2Item.card.header.title && <strong className="font-semibold block text-slate-900">{cardV2Item.card.header.title}</strong>}
                              {cardV2Item.card.header.subtitle && <span className="text-xs text-slate-500 block">{cardV2Item.card.header.subtitle}</span>}
                          </div>
                      )}
                      {cardV2Item.card.sections.map((section, secIndex) => (
                          <div key={secIndex} className="section border-t border-slate-200 p-2 flex flex-col gap-1">
                              {section.widgets.map((widget, widIndex) => (
                                  <div key={widIndex} className="rounded-md bg-slate-200/50 p-2 text-slate-800 text-sm">
                                      {widget.decoratedText.text}
                                  </div>
                              ))}
                          </div>
                      ))}
                  </div>
              ))}
          </div>
      );
  }

  return null;
};


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
