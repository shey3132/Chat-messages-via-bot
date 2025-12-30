
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Widget, SavedWebhook } from '../types';

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
        onAdd({ id: Date.now().toString(), name: nickname.trim(), url: currentUrl.trim() });
        setNickname('');
        setIsSaving(false);
    };

    return (
        <div className="relative w-full">
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <input 
                      type="text" 
                      value={currentUrl} 
                      onChange={(e) => onSelect(e.target.value)} 
                      placeholder="הדבק Webhook URL..." 
                      className="block w-full rounded-xl border border-slate-200 bg-white shadow-sm focus:border-indigo-500 transition-all pr-10 h-11 text-sm font-medium"
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 shadow-sm'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-slide">
                    <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">מועדפים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-8 text-center text-slate-300 text-xs italic">אין פריטים שמורים</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-2 hover:bg-slate-50 group border-b border-slate-50 last:border-0 mx-2 rounded-lg my-1 transition-colors">
                                    <button onClick={() => { onSelect(w.url); setIsOpen(false); }} className="flex-1 text-right px-2">
                                        <div className="font-bold text-slate-800 text-sm">{w.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{w.url}</div>
                                    </button>
                                    <button onClick={() => onDelete(w.id)} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon/></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            {isSaving && (
                <div className="absolute z-50 left-0 mt-2 p-4 bg-white rounded-xl shadow-2xl border border-indigo-100 w-72 animate-slide">
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="שם לשמירה..." className="w-full text-xs rounded-lg border-slate-200 focus:border-indigo-400 h-9 px-3 mb-3 shadow-inner" autoFocus />
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={!nickname.trim()} className="flex-1 bg-indigo-600 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 uppercase tracking-wider">שמור יעד</button>
                        <button onClick={() => setIsSaving(false)} className="px-3 bg-slate-100 text-slate-500 text-[10px] font-bold py-2 rounded-lg hover:bg-slate-200">ביטול</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const githubBlobToRaw = (url: string): string => {
  if (!url || url.startsWith('data:image')) return url;
  try {
    if (url.includes('raw.githubusercontent.com')) return url;
    if (!url.includes('github.com')) return url;
    return url.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/').replace('?raw=true', '');
  } catch (e) { return url; }
};

export default function GoogleChatSender({ saveHistory, savedWebhooks, onAddWebhook, onDeleteWebhook }: any) {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => localStorage.getItem('last_webhook_url') || '');
  const [mode, setMode] = useState<'text' | 'card'>('card');
  const [plainText, setPlainText] = useState('');
  const [cardData, setCardData] = useState({ title: '', subtitle: '', headerImage: '', cardText: '', images: '', actions: '' });
  const [log, setLog] = useState('מערכת מוכנה לשידור');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => { localStorage.setItem('last_webhook_url', webhookUrl); }, [webhookUrl]);

  const payload = useMemo(() => {
    if (mode === 'text') return { text: plainText.trim() || ' ' };
    const { title, subtitle, headerImage, cardText, images, actions } = cardData;
    const card: Card = { sections: [] };
    if (title || subtitle || headerImage) {
      card.header = { title, subtitle, imageUrl: githubBlobToRaw(headerImage) };
    }
    const widgets: Widget[] = [];
    if (cardText) widgets.push({ textParagraph: { text: cardText } });
    images.split('\n').filter(Boolean).forEach(img => widgets.push({ image: { imageUrl: githubBlobToRaw(img.trim()) } }));
    const btns = actions.split('\n').map(a => a.split('|')).filter(p => p.length === 2).map(([t, u]) => ({ textButton: { text: t.trim(), onClick: { openLink: { url: u.trim() } } } }));
    if (btns.length > 0) widgets.push({ buttonList: { buttons: btns } });
    if (widgets.length > 0) card.sections.push({ widgets });
    return card.sections.length > 0 ? { cards: [card] } : null;
  }, [mode, plainText, cardData]);

  const handleSend = async () => {
    if (!webhookUrl.trim() || !payload) return setLog('שגיאה: חסר תוכן או יעד');
    setIsSending(true);
    setLog('מבצע שידור...');
    try {
      const res = await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        setLog('שוגר בהצלחה!');
        saveHistory(payload, webhookUrl);
      } else setLog(`תקלה בשרת: ${res.status}`);
    } catch { setLog('שגיאת רשת'); }
    finally { setIsSending(false); }
  };

  const inputClasses = "block w-full mt-1 rounded-xl border border-slate-200 bg-white shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm h-11 px-4";

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-8 pb-4">
            
            <section>
               <label className="field-label">יעד ה-Webhook</label>
               <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
               <div>
                  <label className="field-label">סגנון הפצה</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className={inputClasses}>
                     <option value="card">כרטיס עשיר</option>
                     <option value="text">טקסט פשוט</option>
                  </select>
               </div>
               <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white px-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  מצב שידור: {mode.toUpperCase()}
               </div>
            </div>

            <div className="space-y-6 animate-slide">
               {mode === 'text' ? (
                   <div>
                      <label className="field-label">תוכן ההודעה</label>
                      <textarea 
                        value={plainText} 
                        onChange={(e) => setPlainText(e.target.value)} 
                        placeholder="כתבו כאן..." 
                        className="block w-full rounded-xl border border-slate-200 min-h-[120px] p-4 text-sm font-medium focus:border-indigo-400"
                      />
                   </div>
               ) : (
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="field-label">כותרת</label>
                            <input type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} className={inputClasses} />
                         </div>
                         <div>
                            <label className="field-label">תת-כותרת</label>
                            <input type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} className={inputClasses} />
                         </div>
                      </div>
                      <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
                         <div>
                            <label className="field-label">גוף הכרטיס</label>
                            <textarea value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} className="block w-full rounded-xl border border-slate-200 h-24 p-4 text-sm font-medium" />
                         </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                               <label className="field-label">תמונות (URL)</label>
                               <textarea value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} className="block w-full rounded-lg border border-slate-200 h-16 p-2 text-[10px] font-mono" />
                            </div>
                            <div>
                               <label className="field-label">כפתורים (טקסט|URL)</label>
                               <textarea value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} className="block w-full rounded-lg border border-slate-200 h-16 p-2 text-[10px] font-mono" />
                            </div>
                         </div>
                      </div>
                   </div>
               )}
            </div>

            <section>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">תצוגה מקדימה</span>
                    <div className="h-px bg-slate-100 flex-1" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 min-h-[200px] flex items-center justify-center">
                    {payload ? (
                      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {mode === 'text' ? (
                           <div className="p-5 text-sm font-medium text-slate-700 whitespace-pre-wrap">{plainText || 'ממתין לתוכן...'}</div>
                        ) : (
                           <div>
                              {(cardData.title || cardData.subtitle) && (
                                 <div className="p-4 bg-slate-50 border-b border-slate-100">
                                    <div className="font-bold text-slate-900 text-base">{cardData.title}</div>
                                    <div className="text-[10px] text-indigo-600 font-bold uppercase mt-0.5">{cardData.subtitle}</div>
                                 </div>
                              )}
                              <div className="p-5 space-y-4 text-sm text-slate-700">
                                 {cardData.cardText && <div className="whitespace-pre-wrap">{cardData.cardText}</div>}
                                 {cardData.images.split('\n').filter(Boolean).map((img, i) => <img key={i} src={githubBlobToRaw(img)} className="w-full rounded-lg border border-slate-100" />)}
                                 <div className="flex flex-wrap gap-2 pt-2">
                                    {cardData.actions.split('\n').map(a => a.split('|')).filter(p => p.length === 2).map(([t], i) => (
                                       <div key={i} className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-md uppercase tracking-wide">{t.trim()}</div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs font-bold uppercase tracking-widest italic animate-pulse">ממתין לתוכן...</span>
                    )}
                </div>
            </section>
        </div>

        <footer className="pt-6 border-t border-slate-100 mt-4 flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 px-4 h-12 rounded-xl flex-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
               <div className={`w-2 h-2 rounded-full ${isSending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
               {log}
            </div>
            <button 
                onClick={handleSend} 
                disabled={!payload || isSending}
                className="h-12 px-10 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3 disabled:bg-slate-200 disabled:text-slate-400"
            >
                {isSending ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                <span>שדר עכשיו</span>
            </button>
        </footer>
    </div>
  );
}
