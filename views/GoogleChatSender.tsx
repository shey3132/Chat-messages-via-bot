
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
            <div className="flex gap-4">
                <div className="relative flex-1 group">
                    <input 
                      type="text" 
                      value={currentUrl} 
                      onChange={(e) => onSelect(e.target.value)} 
                      placeholder="הדבק כאן את כתובת ה-Webhook..." 
                      className="block w-full rounded-2xl border-slate-300 bg-white shadow-lg shadow-slate-200/20 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all pr-12 h-16 text-sm text-slate-900 placeholder:text-slate-400 font-bold"
                      autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    title="שמירה במועדפים"
                    className={`h-16 w-16 flex items-center justify-center rounded-2xl border-2 transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-200' : 'bg-white text-slate-400 border-white hover:border-indigo-200 hover:text-indigo-600 shadow-sm'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-4 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest px-2 italic">מועדפים שמורים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-16 text-center text-slate-300 italic text-sm font-bold tracking-tight">אין עדיין יעדים שמורים</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-4 hover:bg-indigo-50 group border-b border-slate-50 last:border-0 mx-4 transition-colors rounded-2xl mt-2 first:mt-3 last:mb-3">
                                    <button 
                                        onClick={() => { onSelect(w.url); setIsOpen(false); }}
                                        className="flex-1 text-right px-4 py-2"
                                    >
                                        <div className="font-black text-slate-900 text-base tracking-tight">{w.name}</div>
                                        <div className="text-[11px] text-slate-500 truncate max-w-[340px] mt-1.5 font-mono">{w.url}</div>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(w.id)}
                                        className="p-3 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {isSaving && (
                <div className="absolute z-50 left-0 mt-4 p-8 bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-indigo-100 w-96 animate-in zoom-in-95 duration-200">
                    <h4 className="text-base font-black text-indigo-700 mb-6 uppercase tracking-widest">שמירת יעד חדש</h4>
                    <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="שם זיהוי (למשל: צ'אט הנהלה)"
                        className="w-full text-sm rounded-2xl border-slate-200 bg-slate-50 focus:border-indigo-400 mb-6 h-14 px-6 shadow-inner font-bold"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={!nickname.trim()}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-xs font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 uppercase tracking-widest transition-all hover:scale-[1.02]"
                        >
                            שמור יעד
                        </button>
                        <button 
                            onClick={() => setIsSaving(false)}
                            className="px-6 bg-slate-100 text-slate-600 text-xs font-black py-4 rounded-2xl hover:bg-slate-200 transition-colors"
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

const inputStyles = "block w-full mt-2 rounded-2xl border-slate-200 bg-white shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-sm text-slate-900 px-6 h-14 placeholder:text-slate-300 font-bold";
const labelStyles = "flex items-center gap-2 text-[12px] font-black text-slate-700 uppercase tracking-[0.2em] mb-2 px-1 label-high-contrast";

export default function GoogleChatSender({ saveHistory, savedWebhooks, onAddWebhook, onDeleteWebhook }: any) {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => localStorage.getItem('last_webhook_url') || '');
  const [mode, setMode] = useState<'text' | 'card'>('card');
  const [plainText, setPlainText] = useState('');
  const [cardData, setCardData] = useState({ title: '', subtitle: '', headerImage: '', cardText: '', images: '', actions: '' });
  const [log, setLog] = useState('המערכת מוכנה לשידור');
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
    setLog('מבצע שידור ל-Google Chat...');
    try {
      const res = await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        setLog('ההודעה שוגרה בהצלחה!');
        saveHistory(payload, webhookUrl);
      } else setLog(`תקלה מצד השרת: ${res.status}`);
    } catch { setLog('שגיאת רשת - וודאו חיבור'); }
    finally { setIsSending(false); }
  };

  return (
    <div className="flex flex-col bg-white/80 backdrop-blur-3xl rounded-[4rem] p-10 lg:p-14 shadow-2xl shadow-rose-200/40 border-2 border-white h-full overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pl-6 -ml-6 pr-2 space-y-12 pb-10">
            
            <section>
               <label className={labelStyles}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  כתובת יעד השידור (Webhook URL)
               </label>
               <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-indigo-50/40 p-10 rounded-[3rem] border border-white shadow-inner">
               <div>
                  <label className={labelStyles}>סגנון ההפצה</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className={inputStyles}>
                     <option value="card">כרטיס פרימיום מעוצב</option>
                     <option value="text">טקסט מהיר בלבד</option>
                  </select>
               </div>
               <div className="flex items-end pb-4 text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] italic pr-4">
                  מצב נוכחי: {mode === 'card' ? 'RICH EXPERIENCE' : 'BASIC TEXT'}
               </div>
            </div>

            {mode === 'text' ? (
                <div className="animate-in slide-in-from-bottom-6 duration-500">
                   <label className={labelStyles}>תוכן המסר להפצה</label>
                   <textarea 
                    value={plainText} 
                    onChange={(e) => setPlainText(e.target.value)} 
                    placeholder="כתבו כאן את המסר שלכם לצוות..." 
                    className="block w-full rounded-[3rem] border-slate-200 bg-white shadow-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 min-h-[350px] p-10 text-base leading-relaxed text-slate-900 placeholder:text-slate-300 font-bold" 
                   />
                </div>
            ) : (
                <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div>
                        <label className={labelStyles}>כותרת ראשית (Title)</label>
                        <input type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} className={inputStyles} placeholder="למשל: עדכון רבעוני חשוב" />
                      </div>
                      <div>
                        <label className={labelStyles}>תת-כותרת (Subtitle)</label>
                        <input type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} className={inputStyles} placeholder="מידע משלים..." />
                      </div>
                   </div>

                   <div className="bg-gradient-to-br from-indigo-50/30 to-white rounded-[3.5rem] p-12 border border-white space-y-12 shadow-inner">
                      <div>
                        <label className={labelStyles}>גוף ההודעה המרכזי</label>
                        <textarea value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} className="block w-full rounded-[2.5rem] border-slate-200 bg-white shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 min-h-[180px] p-10 text-base text-slate-800 placeholder:text-slate-200 leading-relaxed font-bold" placeholder="כתבו כאן את תוכן ההודעה המלא..." />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         <div>
                            <label className={labelStyles}>גלריית תמונות (קישור בשורה)</label>
                            <textarea value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} className="block w-full rounded-[2rem] border-slate-100 bg-white h-36 p-6 text-[11px] font-mono text-indigo-500 shadow-sm" placeholder="https://..." />
                         </div>
                         <div>
                            <label className={labelStyles}>כפתורי הנעה לפעולה (טקסט|קישור)</label>
                            <textarea value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} className="block w-full rounded-[2rem] border-slate-100 bg-white h-36 p-6 text-[11px] font-mono text-rose-500 shadow-sm" placeholder="כותרת|URL" />
                         </div>
                      </div>
                   </div>
                </div>
            )}

            <div className="pt-12">
               <div className="flex items-center gap-6 mb-12">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.6em] label-high-contrast">תצוגה מקדימה חיה</span>
                  <div className="h-px bg-slate-200 flex-1" />
               </div>
               <div className="bg-white/40 rounded-[5rem] border-4 border-dashed border-indigo-100 p-12 flex items-center justify-center min-h-[400px] shadow-inner relative overflow-hidden group">
                  {payload ? (
                    <div className="w-full max-w-2xl animate-in zoom-in-95 duration-500 relative z-10">
                       {mode === 'text' ? (
                          <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-indigo-100/60 border-2 border-white whitespace-pre-wrap text-base leading-relaxed text-slate-800 font-bold">{plainText || 'ההודעה תופיע כאן ברגע שתקלידו...'}</div>
                       ) : (
                          <div className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/70 border-2 border-white overflow-hidden group/card hover:scale-[1.02] transition-transform duration-700">
                             {(cardData.title || cardData.subtitle) && (
                                <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                                   <h3 className="font-black text-3xl text-slate-900 tracking-tight leading-tight font-rubik">{cardData.title}</h3>
                                   <p className="text-[13px] text-indigo-600 font-black uppercase tracking-widest mt-3">{cardData.subtitle}</p>
                                </div>
                             )}
                             {cardData.headerImage && <img src={githubBlobToRaw(cardData.headerImage)} className="w-full object-cover max-h-72 group-hover/card:scale-110 transition-transform duration-[2000ms]" />}
                             <div className="p-12 space-y-10">
                                {cardData.cardText && <p className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap font-bold">{cardData.cardText}</p>}
                                {cardData.images.split('\n').filter(Boolean).map((img, i) => (
                                   <img key={i} src={githubBlobToRaw(img)} className="w-full rounded-[3rem] shadow-2xl border-4 border-white" />
                                ))}
                                <div className="flex flex-wrap gap-5 pt-6">
                                   {cardData.actions.split('\n').map(a => a.split('|')).filter(p => p.length === 2).map(([t], i) => (
                                      <div key={i} className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-[13px] font-black rounded-3xl shadow-2xl shadow-indigo-100 uppercase tracking-[0.2em]">{t.trim()}</div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                  ) : (
                    <div className="text-indigo-200 text-base font-black uppercase tracking-[0.5em] animate-pulse italic">ממתין להזנת תוכן לשידור...</div>
                  )}
               </div>
            </div>
        </div>

        <footer className="pt-10 border-t border-slate-100 mt-auto flex flex-col sm:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-6 bg-white border-2 border-slate-100 rounded-3xl p-5 px-10 text-[12px] font-black uppercase tracking-widest text-slate-600 flex-1 shadow-lg">
               <div className={`w-4 h-4 rounded-full ${isSending ? 'bg-amber-500 animate-ping' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)]'}`} />
               <span className="mt-0.5 tracking-[0.1em]">{log}</span>
            </div>
            <button 
                onClick={handleSend}
                disabled={!payload || isSending}
                className="w-full sm:w-auto h-22 px-24 bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-600 text-white rounded-[3rem] font-black text-3xl shadow-2xl shadow-indigo-200 hover:scale-[1.04] hover:-translate-y-2 active:scale-95 transition-all duration-300 flex items-center justify-center gap-6 disabled:from-slate-200 disabled:to-slate-300 disabled:shadow-none disabled:scale-100 disabled:text-slate-400 uppercase tracking-tighter border-4 border-white/40"
            >
                {isSending ? (
                    <div className="animate-spin h-10 w-10 border-4 border-white/30 border-t-white rounded-full" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                )}
                <span>שדר עכשיו</span>
            </button>
        </footer>
    </div>
  );
}
