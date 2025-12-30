
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
                <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={currentUrl} 
                      onChange={(e) => onSelect(e.target.value)} 
                      placeholder="הדבק כאן את ה-Webhook URL..." 
                      className="block w-full rounded-2xl border-slate-200 bg-white shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all pr-12 h-14 text-sm text-slate-900 placeholder:text-slate-400"
                      autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 00(5.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    title="שמור יעד זה"
                    className={`h-14 w-14 flex items-center justify-center rounded-2xl border transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-4 bg-white rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-5 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">יעדים שמורים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-12 text-center text-slate-300 italic text-sm">אין פריטים שמורים עדיין</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-3 hover:bg-slate-50 group border-b border-slate-50 last:border-0 mx-3 transition-colors rounded-2xl mt-1 first:mt-2 last:mb-2">
                                    <button 
                                        onClick={() => { onSelect(w.url); setIsOpen(false); }}
                                        className="flex-1 text-right px-4 py-2"
                                    >
                                        <div className="font-black text-slate-800 text-sm tracking-tight">{w.name}</div>
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
                <div className="absolute z-50 left-0 mt-4 p-6 bg-white rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-indigo-100 w-80 animate-in zoom-in-95 duration-200">
                    <h4 className="text-sm font-black text-indigo-600 mb-4 uppercase tracking-widest">שמירת יעד חדש</h4>
                    <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="שם לזיהוי (למשל: צ'אט הנהלה)"
                        className="w-full text-sm rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 mb-4 h-12 px-4"
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

const inputStyles = "block w-full mt-2 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all text-sm text-slate-900 px-5 h-12 placeholder:text-slate-300 font-medium";
const labelStyles = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 px-1";

export default function GoogleChatSender({ saveHistory, savedWebhooks, onAddWebhook, onDeleteWebhook }: any) {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => localStorage.getItem('last_webhook_url') || '');
  const [mode, setMode] = useState<'text' | 'card'>('card');
  const [plainText, setPlainText] = useState('');
  const [cardData, setCardData] = useState({ title: '', subtitle: '', headerImage: '', cardText: '', images: '', actions: '' });
  const [log, setLog] = useState('מוכן לשידור');
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
    setLog('משדר הודעה...');
    try {
      const res = await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        setLog('ההודעה שוגרה בהצלחה!');
        saveHistory(payload, webhookUrl);
      } else setLog(`תקלה בשרת: ${res.status}`);
    } catch { setLog('שגיאת תקשורת ברשת'); }
    finally { setIsSending(false); }
  };

  return (
    <div className="flex flex-col bg-white/70 backdrop-blur-3xl rounded-[3.5rem] p-8 lg:p-10 shadow-2xl shadow-slate-200/50 border border-white h-full overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pl-4 -ml-4 pr-1 space-y-10 pb-10">
            
            <section>
               <label className={labelStyles}>יעד ההפצה (Webhook)</label>
               <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
               <div>
                  <label className={labelStyles}>מבנה ההודעה</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className={inputStyles}>
                     <option value="card">כרטיס מעוצב פרימיום</option>
                     <option value="text">טקסט חופשי בלבד</option>
                  </select>
               </div>
               <div className="flex items-end pb-3 text-slate-400 text-[9px] font-black uppercase tracking-widest italic pr-2">
                  פורמט: {mode === 'card' ? 'Interactive Layout' : 'Standard Text'}
               </div>
            </div>

            {mode === 'text' ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                   <label className={labelStyles}>תוכן ההודעה</label>
                   <textarea 
                    value={plainText} 
                    onChange={(e) => setPlainText(e.target.value)} 
                    placeholder="הקלד כאן את ההודעה שלך..." 
                    className="block w-full rounded-[2.5rem] border-slate-200 bg-white shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 min-h-[300px] p-8 text-sm leading-relaxed text-slate-800 placeholder:text-slate-300 font-medium" 
                   />
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className={labelStyles}>כותרת ראשית</label>
                        <input type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} className={inputStyles} placeholder="למשל: עדכון חשוב..." />
                      </div>
                      <div>
                        <label className={labelStyles}>תת-כותרת (סמולר)</label>
                        <input type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} className={inputStyles} placeholder="פירוט קצר..." />
                      </div>
                   </div>

                   <div>
                      <label className={labelStyles}>תמונת כותרת (קישור URL)</label>
                      <input type="text" value={cardData.headerImage} onChange={(e) => setCardData({...cardData, headerImage: e.target.value})} className={inputStyles} placeholder="https://..." />
                   </div>

                   <div className="bg-white/50 rounded-[3rem] p-8 border border-slate-100 space-y-8 shadow-inner">
                      <div>
                        <label className={labelStyles}>גוף ההודעה</label>
                        <textarea value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} className="block w-full rounded-[2rem] border-slate-200 bg-white shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 min-h-[140px] p-6 text-sm text-slate-800 placeholder:text-slate-300 leading-relaxed font-medium" placeholder="כתבו כאן את תוכן ההודעה..." />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div>
                            <label className={labelStyles}>גלריית תמונות (קישור בשורה)</label>
                            <textarea value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} className="block w-full rounded-2xl border-slate-200 bg-white shadow-sm focus:border-indigo-400 h-28 p-4 text-[10px] font-mono text-indigo-500 placeholder:text-slate-200" placeholder="https://..." />
                         </div>
                         <div>
                            <label className={labelStyles}>כפתורי פעולה (שם|קישור)</label>
                            <textarea value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} className="block w-full rounded-2xl border-slate-200 bg-white shadow-sm focus:border-indigo-400 h-28 p-4 text-[10px] font-mono text-teal-600 placeholder:text-slate-200" placeholder="לאתר|https://..." />
                         </div>
                      </div>
                   </div>
                </div>
            )}

            <div className="pt-6">
               <div className="flex items-center gap-6 mb-6">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">תצוגה מקדימה חיה</span>
                  <div className="h-px bg-slate-200 flex-1" />
               </div>
               <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 p-8 flex items-center justify-center min-h-[250px] shadow-inner relative overflow-hidden">
                  {payload ? (
                    <div className="w-full max-w-xl animate-in zoom-in-95 duration-500 relative z-10">
                       {mode === 'text' ? (
                          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 font-medium">{plainText || 'ההודעה תופיע כאן...'}</div>
                       ) : (
                          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                             {(cardData.title || cardData.subtitle) && (
                                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                   <h3 className="font-black text-xl text-slate-800 tracking-tight leading-tight">{cardData.title}</h3>
                                   <p className="text-[11px] text-indigo-600 font-black uppercase tracking-widest mt-1.5">{cardData.subtitle}</p>
                                </div>
                             )}
                             {cardData.headerImage && <img src={githubBlobToRaw(cardData.headerImage)} className="w-full object-cover max-h-56" />}
                             <div className="p-8 space-y-6">
                                {cardData.cardText && <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{cardData.cardText}</p>}
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
                    <div className="text-slate-300 text-sm font-black uppercase tracking-widest animate-pulse italic">ממתין לתוכן...</div>
                  )}
               </div>
            </div>
        </div>

        <footer className="pt-8 border-t border-slate-100 mt-auto flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 flex-1 shadow-inner">
               <div className={`w-2.5 h-2.5 rounded-full ${isSending ? 'bg-amber-500 animate-ping' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} />
               <span className="mt-0.5">{log}</span>
            </div>
            <button 
                onClick={handleSend}
                disabled={!payload || isSending}
                className="w-full sm:w-auto h-16 px-14 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 disabled:bg-slate-200 disabled:shadow-none disabled:scale-100 disabled:text-slate-400 uppercase tracking-tighter"
            >
                {isSending ? (
                    <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                )}
                <span>שידור להפצה</span>
            </button>
        </footer>
    </div>
  );
}
