
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
            <div className="flex gap-3">
                <div className="relative flex-1 group">
                    <input 
                      type="text" 
                      value={currentUrl} 
                      onChange={(e) => onSelect(e.target.value)} 
                      placeholder="הדבק כאן את כתובת ה-Webhook..." 
                      className="block w-full rounded-2xl border-slate-200 bg-white/80 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all pr-12 h-14 text-sm text-slate-800 placeholder:text-slate-400 font-medium"
                      autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 00(5.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    title="שמירה ברשימת המועדפים"
                    className={`h-14 w-14 flex items-center justify-center rounded-2xl border-2 transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border-white hover:border-indigo-200 hover:text-indigo-600 shadow-sm'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-4 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">מועדפים שמורים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-12 text-center text-slate-300 italic text-sm">אין עדיין יעדים שמורים</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-3 hover:bg-indigo-50/50 group border-b border-slate-50 last:border-0 mx-3 transition-colors rounded-2xl mt-1 first:mt-2 last:mb-2">
                                    <button 
                                        onClick={() => { onSelect(w.url); setIsOpen(false); }}
                                        className="flex-1 text-right px-4 py-2"
                                    >
                                        <div className="font-bold text-slate-800 text-sm tracking-tight">{w.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[300px] mt-1 font-mono">{w.url}</div>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(w.id)}
                                        className="p-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-50"
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
                <div className="absolute z-50 left-0 mt-4 p-6 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-indigo-100 w-80 animate-in zoom-in-95 duration-200">
                    <h4 className="text-sm font-black text-indigo-600 mb-4 uppercase tracking-widest">שמירת יעד חדש</h4>
                    <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="שם קליט לזיהוי..."
                        className="w-full text-sm rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 mb-4 h-12 px-4 shadow-inner"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSave}
                            disabled={!nickname.trim()}
                            className="flex-1 bg-indigo-600 text-white text-xs font-black py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 uppercase tracking-widest shadow-lg shadow-indigo-100"
                        >
                            שמור יעד
                        </button>
                        <button 
                            onClick={() => setIsSaving(false)}
                            className="px-5 bg-slate-100 text-slate-500 text-xs font-bold py-3 rounded-xl hover:bg-slate-200"
                        >
                            ביטול
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const githubBlobToRaw = (url: string): string => {
  if (!url || url.startsWith('data:image')) return url;
  try {
    if (url.includes('raw.githubusercontent.com')) return url;
    if (!url.includes('github.com')) return url;
    return url.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/').replace('?raw=true', '');
  } catch (e) { return url; }
};

const inputStyles = "block w-full mt-2 rounded-2xl border-slate-200 bg-white/90 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all text-sm text-slate-800 px-5 h-12 placeholder:text-slate-300 font-medium";
const labelStyles = "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 px-1";

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
    if (!webhookUrl.trim() || !payload) return setLog('שגיאה: חסר תוכן או כתובת יעד');
    setIsSending(true);
    setLog('משדר נתונים ל-Google Chat...');
    try {
      const res = await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        setLog('ההודעה שוגרה בהצלחה!');
        saveHistory(payload, webhookUrl);
      } else setLog(`תקלה בתקשורת: ${res.status}`);
    } catch { setLog('שגיאת רשת - וודא חיבור לאינטרנט'); }
    finally { setIsSending(false); }
  };

  return (
    <div className="flex flex-col bg-white/70 backdrop-blur-3xl rounded-[3.5rem] p-8 lg:p-10 shadow-2xl shadow-indigo-100/50 border-2 border-white h-full overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pl-4 -ml-4 pr-1 space-y-10 pb-10">
            
            <section>
               <label className={labelStyles}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  כתובת יעד (Webhook)
               </label>
               <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/80 p-6 rounded-[2.5rem] border border-white shadow-inner">
               <div>
                  <label className={labelStyles}>סגנון הודעה</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className={inputStyles}>
                     <option value="card">כרטיס אינטראקטיבי מעוצב</option>
                     <option value="text">טקסט פשוט ומהיר</option>
                  </select>
               </div>
               <div className="flex items-end pb-3 text-slate-400 text-[9px] font-black uppercase tracking-widest italic pr-2 opacity-60">
                  סוג תצוגה: {mode === 'card' ? 'Rich Interface' : 'Standard Text'}
               </div>
            </div>

            {mode === 'text' ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                   <label className={labelStyles}>תוכן ההודעה לשליחה</label>
                   <textarea 
                    value={plainText} 
                    onChange={(e) => setPlainText(e.target.value)} 
                    placeholder="כתבו כאן את המסר שלכם..." 
                    className="block w-full rounded-[2.5rem] border-slate-200 bg-white/90 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 min-h-[300px] p-8 text-sm leading-relaxed text-slate-800 placeholder:text-slate-300 font-medium" 
                   />
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className={labelStyles}>כותרת ראשית בולטת</label>
                        <input type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} className={inputStyles} placeholder="למשל: עדכון צוות דחוף..." />
                      </div>
                      <div>
                        <label className={labelStyles}>פירוט קצר מתחת לכותרת</label>
                        <input type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} className={inputStyles} placeholder="מידע משני..." />
                      </div>
                   </div>

                   <div>
                      <label className={labelStyles}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         קישור לתמונת באנר (URL)
                      </label>
                      <input type="text" value={cardData.headerImage} onChange={(e) => setCardData({...cardData, headerImage: e.target.value})} className={inputStyles} placeholder="הדבק כאן קישור לתמונה..." />
                   </div>

                   <div className="bg-indigo-50/30 rounded-[3rem] p-8 border border-white space-y-8 shadow-inner">
                      <div>
                        <label className={labelStyles}>גוף הטקסט המרכזי</label>
                        <textarea value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} className="block w-full rounded-[2rem] border-slate-200 bg-white shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 min-h-[140px] p-6 text-sm text-slate-800 placeholder:text-slate-300 leading-relaxed font-medium" placeholder="כאן כותבים את הסיפור..." />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div>
                            <label className={labelStyles}>קישורי תמונות (אחד לשורה)</label>
                            <textarea value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} className="block w-full rounded-2xl border-slate-200 bg-white shadow-sm focus:border-indigo-400 h-28 p-4 text-[10px] font-mono text-indigo-500 placeholder:text-slate-200" placeholder="https://..." />
                         </div>
                         <div>
                            <label className={labelStyles}>כפתורי לחיצה (טקסט|קישור)</label>
                            <textarea value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} className="block w-full rounded-2xl border-slate-200 bg-white shadow-sm focus:border-indigo-400 h-28 p-4 text-[10px] font-mono text-teal-600 placeholder:text-slate-200" placeholder="הקש כאן|https://..." />
                         </div>
                      </div>
                   </div>
                </div>
            )}

            <div className="pt-6">
               <div className="flex items-center gap-6 mb-6">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">תצוגה מקדימה חיה</span>
                  <div className="h-px bg-slate-200 flex-1" />
               </div>
               <div className="bg-white/40 rounded-[3rem] border-2 border-dashed border-indigo-100 p-8 flex items-center justify-center min-h-[250px] shadow-inner relative overflow-hidden group">
                  {payload ? (
                    <div className="w-full max-w-xl animate-in zoom-in-95 duration-500 relative z-10">
                       {mode === 'text' ? (
                          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">{plainText || 'ההודעה תופיע כאן...'}</div>
                       ) : (
                          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden">
                             {(cardData.title || cardData.subtitle) && (
                                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                   <h3 className="font-black text-xl text-slate-800 tracking-tight leading-tight">{cardData.title}</h3>
                                   <p className="text-[11px] text-indigo-600 font-black uppercase tracking-widest mt-1.5">{cardData.subtitle}</p>
                                </div>
                             )}
                             {cardData.headerImage && <img src={githubBlobToRaw(cardData.headerImage)} className="w-full object-cover max-h-56 group-hover:scale-105 transition-transform duration-700" />}
                             <div className="p-8 space-y-6">
                                {cardData.cardText && <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{cardData.cardText}</p>}
                                {cardData.images.split('\n').filter(Boolean).map((img, i) => (
                                   <img key={i} src={githubBlobToRaw(img)} className="w-full rounded-3xl shadow-lg border border-slate-100" />
                                ))}
                                <div className="flex flex-wrap gap-3 pt-2">
                                   {cardData.actions.split('\n').map(a => a.split('|')).filter(p => p.length === 2).map(([t], i) => (
                                      <div key={i} className="px-6 py-2.5 bg-indigo-600 text-white text-[11px] font-black rounded-xl shadow-lg shadow-indigo-100 uppercase tracking-widest">{t.trim()}</div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                  ) : (
                    <div className="text-slate-300 text-sm font-black uppercase tracking-widest animate-pulse italic">ממתין להזנת תוכן...</div>
                  )}
               </div>
            </div>
        </div>

        <footer className="pt-8 border-t border-slate-100 mt-auto flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 flex-1 shadow-sm">
               <div className={`w-3 h-3 rounded-full ${isSending ? 'bg-amber-500 animate-ping' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
               <span className="mt-0.5">{log}</span>
            </div>
            <button 
                onClick={handleSend}
                disabled={!payload || isSending}
                className="w-full sm:w-auto h-16 px-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-200 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:scale-100 disabled:text-slate-500 uppercase tracking-tighter border border-white/20"
            >
                {isSending ? (
                    <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                )}
                <span>שידור להפצה עכשיו</span>
            </button>
        </footer>
    </div>
  );
}
