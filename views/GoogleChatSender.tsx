
import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { ChatMessagePayload, Card, Section, Widget, Button, SavedWebhook } from '../types';

// --- Webhook Selector Component ---
interface WebhookSelectorProps {
  currentUrl: string;
  onSelect: (url: string) => void;
  savedWebhooks: SavedWebhook[];
  onAdd: (webhook: SavedWebhook) => void;
  onDelete: (id: string) => void;
}

const WebhookSelector: React.FC<WebhookSelectorProps> = ({ currentUrl, onSelect, savedWebhooks, onAdd, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [nickname, setNickname] = useState('');

    const handleSave = () => {
        if (!nickname.trim() || !currentUrl.trim()) return;
        onAdd({
            id: Date.now().toString(),
            name: nickname.trim(),
            url: currentUrl.trim()
        });
        setNickname('');
        setIsSaving(false);
    };

    return (
        <div className="relative w-full">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={currentUrl} 
                      onChange={(e) => onSelect(e.target.value)} 
                      placeholder="הדבק כאן את ה-Webhook URL..." 
                      className="block w-full rounded-lg border-slate-300 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition duration-150 ease-in-out pr-10"
                      autoComplete="off"
                    />
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    title="שמור וובוק זה"
                    className={`p-2 rounded-lg border transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">וובוקים שמורים</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-sm italic">אין וובוקים שמורים עדיין</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-1 hover:bg-slate-50 group">
                                    <button 
                                        onClick={() => { onSelect(w.url); setIsOpen(false); }}
                                        className="flex-1 text-right px-3 py-2"
                                    >
                                        <div className="font-bold text-slate-800 text-sm">{w.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[250px]">{w.url}</div>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(w.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {isSaving && (
                <div className="absolute z-50 left-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-indigo-100 w-64 animate-in zoom-in duration-200">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">כינוי לוובוק</label>
                    <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="למשל: צ'אט צוות פיתוח"
                        className="w-full text-sm rounded-lg border-slate-200 focus:border-indigo-500 mb-3"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSave}
                            disabled={!nickname.trim()}
                            className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            שמור
                        </button>
                        <button 
                            onClick={() => setIsSaving(false)}
                            className="px-3 bg-slate-100 text-slate-500 text-xs font-bold py-2 rounded-lg hover:bg-slate-200"
                        >
                            ביטול
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

interface CardFormData {
  title: string;
  subtitle: string;
  headerImage: string;
  cardText: string;
  images: string;
  actions: string;
}
type Mode = 'text' | 'card';
type AfterSendAction = 'keep' | 'clear';

const initialCardFormData: CardFormData = {
  title: '',
  subtitle: '',
  headerImage: '',
  cardText: '',
  images: '',
  actions: '',
};

const PAYLOAD_SIZE_LIMIT = 32000;

const githubBlobToRaw = (url: string): string => {
  if (!url || url.startsWith('data:image')) return url;
  try {
    if (url.includes('raw.githubusercontent.com')) return url;
    if (!url.includes('github.com')) return url;
    return url.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/').replace('?raw=true', '');
  } catch (e) {
    return url;
  }
};

const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const commonInputClasses = "block w-full mt-1 rounded-lg border-slate-300 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition duration-150 ease-in-out";
const labelClasses = "block text-sm font-medium text-slate-600";

interface GoogleChatSenderProps {
    saveHistory: (payload: ChatMessagePayload, webhookUrl: string) => void;
    savedWebhooks: SavedWebhook[];
    onAddWebhook: (webhook: SavedWebhook) => void;
    onDeleteWebhook: (id: string) => void;
}

export default function GoogleChatSender({ saveHistory, savedWebhooks, onAddWebhook, onDeleteWebhook }: GoogleChatSenderProps) {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => localStorage.getItem('last_webhook_url') || '');
  const [mode, setMode] = useState<Mode>('card');
  const [afterSend, setAfterSend] = useState<AfterSendAction>('keep');
  const [plainText, setPlainText] = useState<string>('');
  const [cardData, setCardData] = useState<CardFormData>(initialCardFormData);
  const [log, setLog] = useState<string>('מוכן.');
  const [payloadSize, setPayloadSize] = useState(0);

  useEffect(() => {
    localStorage.setItem('last_webhook_url', webhookUrl);
  }, [webhookUrl]);

  const payload = useMemo<ChatMessagePayload | null>(() => {
    if (mode === 'text') {
      return { text: plainText.trim() || ' ' };
    }

    const { title, subtitle, headerImage, cardText, images, actions } = cardData;
    const headerImageUrl = githubBlobToRaw(headerImage.trim());
    const imageList = images.split('\n').map(s => s.trim()).filter(Boolean).map(githubBlobToRaw);
    const actionList = actions.split('\n').map(s => s.trim()).filter(Boolean);

    const card: Card = { sections: [] };

    if (title.trim() || subtitle.trim() || headerImageUrl) {
      card.header = {};
      if (title.trim()) card.header.title = title.trim();
      if (subtitle.trim()) card.header.subtitle = subtitle.trim();
      if (headerImageUrl) card.header.imageUrl = headerImageUrl;
    }

    const mainWidgets: Widget[] = [];
    if (cardText.trim()) {
      mainWidgets.push({ textParagraph: { text: cardText.trim() } });
    }
    imageList.forEach(url => mainWidgets.push({ image: { imageUrl: url } }));
    
    const buttons: Button[] = actionList
      .map(line => {
        const [text, url] = line.split('|').map(s => s.trim());
        if (text && url) {
          return {
            textButton: { text, onClick: { openLink: { url } } },
          };
        }
        return null;
      })
      .filter((b): b is Button => b !== null);

    if (buttons.length > 0) {
      mainWidgets.push({ buttonList: { buttons } });
    }

    if (mainWidgets.length > 0) {
      card.sections.push({ widgets: mainWidgets });
    }
    
    if (card.sections.length === 0) return null;
    return { cards: [card] };
  }, [mode, plainText, cardData]);
  
    useEffect(() => {
        if (payload) {
            const payloadString = JSON.stringify(payload);
            const size = new TextEncoder().encode(payloadString).length;
            setPayloadSize(size);
        } else {
            setPayloadSize(0);
        }
    }, [payload]);

  const handleSend = async () => {
    if (!webhookUrl.trim()) {
      setLog('שגיאה: חובה להזין Webhook URL!');
      return;
    }
    if (!payload) {
      setLog('שגיאה: אין תוכן לשליחה.');
      return;
    }

    setLog(`שולח...`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        setLog(`שגיאה בשליחה: HTTP ${response.status}`);
      } else {
        setLog(`ההודעה נשלחה בהצלחה!`);
        saveHistory(payload, webhookUrl);
        if (afterSend === 'clear') {
          setPlainText('');
          setCardData(initialCardFormData);
        }
      }
    } catch (error) {
      setLog(`שגיאת רשת.`);
    }
  };

  const isOversized = payloadSize > PAYLOAD_SIZE_LIMIT;

  return (
    <div className="flex flex-col bg-white/70 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 h-full">
        <header className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">משגר הודעות חכם</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 pl-4 space-y-6">
          <div>
            <label className={labelClasses}>Webhook URL</label>
            <WebhookSelector 
                currentUrl={webhookUrl} 
                onSelect={setWebhookUrl} 
                savedWebhooks={savedWebhooks}
                onAdd={onAddWebhook}
                onDelete={onDeleteWebhook}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mode" className={labelClasses}>סוג ההודעה</label>
              <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={commonInputClasses}>
                <option value="card">כרטיס מעוצב</option>
                <option value="text">טקסט פשוט</option>
              </select>
            </div>
            <div>
              <label htmlFor="after" className={labelClasses}>התנהגות לאחר שליחה</label>
              <select id="after" value={afterSend} onChange={(e) => setAfterSend(e.target.value as AfterSendAction)} className={commonInputClasses}>
                <option value="keep">השאר תוכן</option>
                <option value="clear">נקה שדות</option>
              </select>
            </div>
          </div>
          
          {mode === 'text' ? (
            <div>
              <label htmlFor="plainText" className={labelClasses}>טקסט להודעה</label>
              <textarea id="plainText" value={plainText} onChange={(e) => setPlainText(e.target.value)} className={`${commonInputClasses} min-h-[150px]`}></textarea>
            </div>
          ) : (
            <div className="space-y-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                  <label htmlFor="title" className={labelClasses}>כותרת (title)</label>
                  <input id="title" type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} placeholder="כותרת הכרטיס" className={commonInputClasses} />
                </div>
                <div>
                  <label htmlFor="subtitle" className={labelClasses}>תת-כותרת (subtitle)</label>
                  <input id="subtitle" type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} placeholder="טקסט משני" className={commonInputClasses} />
                </div>
              </div>
              
              <div>
                <label htmlFor="headerImage" className={labelClasses}>קישור לתמונת כותרת</label>
                <input id="headerImage" type="text" value={cardData.headerImage} onChange={(e) => setCardData({...cardData, headerImage: e.target.value})} placeholder="https://example.com/header.jpg" className={commonInputClasses} />
              </div>

              <div>
                <label htmlFor="cardText" className={labelClasses}>טקסט בכרטיס</label>
                <textarea id="cardText" value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} placeholder="תוכן ההודעה..." className={`${commonInputClasses} min-h-[100px]`}></textarea>
              </div>

              <div>
                <label htmlFor="images" className={labelClasses}>קישורי תמונות (שורה נפרדת לכל אחת)</label>
                <textarea id="images" value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} placeholder="https://example.com/image1.jpg" className={`${commonInputClasses} min-h-[100px]`}></textarea>
              </div>

              <div>
                <label htmlFor="actions" className={labelClasses}>פעולות (פורמט: כותרת|URL)</label>
                <textarea id="actions" value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} placeholder="האתר שלי|https://example.com" className={`${commonInputClasses} min-h-[100px]`}></textarea>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <label className={labelClasses}>תצוגה מקדימה חיה</label>
            <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-4 min-h-[250px] bg-slate-100/50 overflow-hidden">
                {payload ? (
                    <div className="flex flex-col gap-4">
                    {payload.text ? (
                        <div className="whitespace-pre-wrap p-4 text-sm">{payload.text}</div>
                    ) : (
                        payload.cards?.map((card, idx) => (
                            <div key={idx} className="preview-card border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm w-full text-sm">
                                {card.header && (
                                    <div className="card-header p-4">
                                        <strong className="text-base font-semibold block text-slate-900">{card.header.title}</strong>
                                        <span className="text-xs text-slate-500 block mt-0.5">{card.header.subtitle}</span>
                                        {card.header.imageUrl && <img src={card.header.imageUrl} className="w-full rounded-lg mt-3" />}
                                    </div>
                                )}
                                {card.sections?.map((sec, sidx) => (
                                    <div key={sidx} className="section border-t border-slate-200 p-4 flex flex-col gap-3">
                                        {sec.widgets.map((w, widx) => (
                                            <div key={widx}>
                                                {w.textParagraph && <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{w.textParagraph.text}</p>}
                                                {w.image && <img src={w.image.imageUrl} className="max-w-full rounded-lg" />}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                    </div>
                ) : <div className="grid place-content-center h-full text-slate-500">התצוגה תופיע כאן</div>}
            </div>
          </div>

          <div>
            <label className={labelClasses}>לוג</label>
            <pre className="mt-2 p-4 bg-slate-800 text-slate-200 text-xs rounded-lg h-24 overflow-auto whitespace-pre-wrap font-mono">{log}</pre>
          </div>

        </div>
        
        <div className="pt-6 border-t border-slate-200 mt-auto flex justify-between items-center">
          <div className="text-xs text-slate-500">
             <p>גודל הודעה: <span className={`font-bold ${isOversized ? 'text-red-600' : 'text-slate-700'}`}>{formatSize(payloadSize)} / {formatSize(PAYLOAD_SIZE_LIMIT)}</span></p>
          </div>
          <button 
            onClick={handleSend} 
            disabled={isOversized || !payload}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-0 bg-indigo-600 text-white font-bold text-lg cursor-pointer shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-100 transition-all disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            <span>שלח עכשיו</span>
          </button>
        </div>
    </div>
  );
}
