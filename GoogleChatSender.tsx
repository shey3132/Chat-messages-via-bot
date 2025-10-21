import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { ChatMessagePayload, HistoryItem, Card, Section, Widget, Button } from './types';

// --- TYPE DEFINITIONS ---
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

// --- CONSTANTS ---
const PAYLOAD_SIZE_LIMIT = 32000; // 32KB

// --- HELPER FUNCTIONS ---
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

// --- UI SUB-COMPONENTS ---

interface PreviewProps {
  payload: ChatMessagePayload | null;
}

const Preview: React.FC<PreviewProps> = ({ payload }) => {
  if (!payload) return null;

  if (payload.text) {
    return <div className="whitespace-pre-wrap p-4">{payload.text}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {payload.cards?.map((card, cardIndex) => (
        <div key={cardIndex} className="preview-card border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
          {card.header && (
            <div className="card-header p-4">
              {card.header.title && <strong className="text-lg font-semibold block text-slate-900">{card.header.title}</strong>}
              {card.header.subtitle && <span className="text-sm text-slate-500 block mt-0.5">{card.header.subtitle}</span>}
              {card.header.imageUrl && <img src={card.header.imageUrl} alt="Header" className="w-full rounded-lg mt-3" />}
            </div>
          )}
          {card.sections?.map((section, secIndex) => (
            <div key={secIndex} className="section border-t border-slate-200 p-4 flex flex-col gap-3">
              {section.widgets.map((widget, widIndex) => (
                <div key={widIndex}>
                  {widget.textParagraph && <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{widget.textParagraph.text}</p>}
                  {widget.image && <img src={widget.image.imageUrl} alt="Card content" className="max-w-full rounded-lg" />}
                  {widget.buttonList?.buttons.map((btn, btnIndex) => (
                    <a key={btnIndex} href={btn.textButton.onClick.openLink.url} target="_blank" rel="noopener noreferrer" className="action-button inline-block mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors">
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
};

// --- MAIN APP COMPONENT ---

interface GoogleChatSenderProps {
    saveHistory: (payload: ChatMessagePayload) => void;
}

export default function GoogleChatSender({ saveHistory }: GoogleChatSenderProps) {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [mode, setMode] = useState<Mode>('card');
  const [afterSend, setAfterSend] = useState<AfterSendAction>('keep');
  const [plainText, setPlainText] = useState<string>('');
  const [cardData, setCardData] = useState<CardFormData>(initialCardFormData);
  const [log, setLog] = useState<string>('מוכן.');
  const [payloadSize, setPayloadSize] = useState(0);

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
    
    if (card.sections.length === 0) {
        return null;
    }

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

  const handleCardDataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCardData(prev => ({ ...prev, [id]: value }));
  };

  const handleSend = async () => {
    if (!webhookUrl.trim()) {
      setLog('שגיאה: חובה להזין Webhook URL!');
      return;
    }
    if (!payload) {
      setLog('שגיאה: אין תוכן לשליחה. כרטיס חייב להכיל לפחות רכיב אחד בגוף ההודעה (טקסט, תמונה או כפתור).');
      return;
    }

    const payloadString = JSON.stringify(payload);
    if (payloadSize > PAYLOAD_SIZE_LIMIT) {
        setLog(`שגיאה: ההודעה גדולה מדי (${formatSize(payloadSize)}). הגודל המירבי הוא ${formatSize(PAYLOAD_SIZE_LIMIT)}.\n\nטיפ: הקטינו את כמות הטקסט או השתמשו בקיצורי URL.`);
        return;
    }

    setLog(`שולח...\n${payloadString}`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString
      });
      const responseBody = await response.text();

      if (!response.ok) {
        setLog(`שגיאה בשליחה: HTTP ${response.status}\n\nתגובה:\n${responseBody}`);
      } else {
        setLog(`ההודעה נשלחה בהצלחה! HTTP ${response.status}\n\nתגובה:\n${responseBody}`);
        saveHistory(payload); // Save to shared history
        if (afterSend === 'clear') {
          setPlainText('');
          setCardData(initialCardFormData);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLog(`שגיאת רשת: ${message}`);
      console.error("Webhook send error:", error);
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
            <label htmlFor="webhook" className={labelClasses}>Webhook URL</label>
            <input id="webhook" type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://chat.googleapis.com/v1/spaces/..." className={commonInputClasses} />
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
                  <input id="title" type="text" value={cardData.title} onChange={handleCardDataChange} placeholder="כותרת הכרטיס" className={commonInputClasses} />
                </div>
                <div>
                  <label htmlFor="subtitle" className={labelClasses}>תת-כותרת (subtitle)</label>
                  <input id="subtitle" type="text" value={cardData.subtitle} onChange={handleCardDataChange} placeholder="טקסט משני" className={commonInputClasses} />
                </div>
              </div>
              
              <div>
                <label htmlFor="headerImage" className={labelClasses}>קישור לתמונת כותרת (Header Image URL)</label>
                <input id="headerImage" type="text" value={cardData.headerImage} onChange={handleCardDataChange} placeholder="https://example.com/header.jpg" className={commonInputClasses} />
                <p className="mt-2 text-xs text-slate-500">
                  הדביקו קישור ישיר לתמונה (חייב להתחיל ב-<code>https://</code>). Google Chat לא תומך בהעלאת קבצים ישירות.
                  <br />
                  <b>צריכים לארח תמונה?</b> השתמשו באתר כמו{' '}
                  <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Postimages
                  </a>{' '}
                  כדי לקבל "קישור ישיר" (Direct Link).
                </p>
              </div>

              <div>
                <label htmlFor="cardText" className={labelClasses}>טקסט בכרטיס</label>
                <textarea id="cardText" value={cardData.cardText} onChange={handleCardDataChange} placeholder="תוכן ההודעה..." className={`${commonInputClasses} min-h-[100px]`}></textarea>
              </div>

              <div>
                <label htmlFor="images" className={labelClasses}>קישורי תמונות בגוף הכרטיס (כל כתובת בשורה חדשה)</label>
                <textarea id="images" value={cardData.images} onChange={handleCardDataChange} placeholder="https://example.com/image1.jpg" className={`${commonInputClasses} min-h-[100px]`}></textarea>
                 <p className="mt-2 text-xs text-slate-500">
                   גם כאן, יש להשתמש בקישורים ישירים בלבד. ניתן להוסיף מספר תמונות, כל אחת בשורה נפרדת.
                </p>
              </div>

              <div>
                <label htmlFor="actions" className={labelClasses}>פעולות (כפתורים) – פורמט: <code>כותרת|URL</code></label>
                <textarea id="actions" value={cardData.actions} onChange={handleCardDataChange} placeholder="האתר שלי|https://example.com" className={`${commonInputClasses} min-h-[100px]`}></textarea>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <label className={labelClasses}>תצוגה מקדימה חיה</label>
            <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-4 min-h-[250px] bg-slate-100/50">
              {payload ? <Preview payload={payload} /> : <div className="grid place-content-center h-full text-slate-500">התצוגה תופיע כאן</div>}
            </div>
          </div>

          <div>
            <label className={labelClasses}>לוג</label>
            <pre className="mt-2 p-4 bg-slate-800 text-slate-200 text-sm rounded-lg h-32 overflow-auto whitespace-pre-wrap font-mono">{log}</pre>
          </div>

        </div>
        
        <div className="pt-6 border-t border-slate-200 mt-auto flex justify-between items-center">
          <div className="text-sm text-slate-500 space-y-1">
             <p className="hidden md:block">יצירת הודעות עשירות ל-Google Chat</p>
             <p>גודל הודעה: <span className={`font-bold ${isOversized ? 'text-red-600' : 'text-slate-700'}`}>{formatSize(payloadSize)} / {formatSize(PAYLOAD_SIZE_LIMIT)}</span></p>
          </div>
          <button 
            onClick={handleSend} 
            disabled={isOversized || !payload}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-0 bg-indigo-600 text-white font-bold text-lg cursor-pointer shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-slate-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            <span>שלח עכשיו</span>
          </button>
        </div>
    </div>
  );
}