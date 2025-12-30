
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
                      className="block w-full rounded-2xl border-rose-100 bg-white shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 transition-all pr-12 h-14 text-sm text-slate-800 placeholder:text-slate-300 font-medium"
                      autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-600 transition-colors rounded-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    title="שמור יעד"
                    className={`h-14 w-14 flex items-center justify-center rounded-2xl border-2 transition-all ${isSaving ? 'bg-rose-600 text-white border-rose-500 shadow-xl shadow-rose-200' : 'bg-white text-slate-300 border-white hover:border-rose-200 hover:text-rose-600 shadow-sm'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-4 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(244,63,94,0.1)] border border-rose-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-5 border-b border-rose-50 bg-rose-50/30 flex justify-between items-center">
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-2 italic">יעדים מועדפים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-12 text-center text-slate-300 italic text-sm">אין פריטים שמורים</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-3 hover:bg-rose-50/50 group border-b border-slate-50 last:border-0 mx-3 transition-colors rounded-2xl mt-1 first:mt-2 last:mb-2">
                                    <button 
                                        onClick={() => { onSelect(w.url); setIsOpen(false); }}
                                        className="flex-1 text-right px-4 py-2"
                                    >
                                        <div className="font-bold text-slate-800 text-sm tracking-tight">{w.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[320px] mt-1 font-mono">{w.url}</div>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(w.id)}
                                        className="p-3 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {isSaving && (
                <div className="absolute z-50 left-0 mt-4 p-8 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-rose-100 w-80 animate-in zoom-in-95 duration-200">
                    <h4 className="text-sm font-black text-rose-600 mb-5 uppercase tracking-widest">שמירת יעד חדש</h4>
                    <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="שם זיהוי..."
                        className="w-full text-sm rounded-xl border-slate-200 bg-slate-50 focus:border-rose-400 mb-5 h-12 px-5 shadow-inner"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSave}
                            disabled={!nickname.trim()}
                            className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-black py-3.5 rounded-xl shadow-lg shadow-rose-100 uppercase tracking-widest transition-all hover:scale-[1.02]"
                        >
                            שמור יעד
                        </button>
                        <button 
                            onClick={() => setIsSaving(false)}
                            className="px-5 bg-slate-100 text-slate-500 text-xs font-bold py-3.5 rounded-xl hover:bg-slate-200"
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

const inputStyles = "block w-full mt-2 rounded-2xl border-rose-50 bg-white/80 shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all text-sm text-slate-800 px-5 h-12 placeholder:text-slate-200 font-medium";
const labelStyles = "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 px-1";

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
    <div className="flex flex-col bg-white/70 backdrop-blur-3xl rounded-[3.5rem] p-8 lg:p-12 shadow-2xl shadow-rose-100/40 border border-white h-full overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pl-4 -ml-4 pr-1 space-y-12 pb-10">
            
            <section>
               <label className={labelStyles}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  יעד השידור (Webhook URL)
               </label>
               <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-rose-50/20 p-8 rounded-[3rem] border border-rose-50 shadow-inner">
               <div>
                  <label className={labelStyles}>סגנון ההפצה</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className={inputStyles}>
                     <option value="card">כרטיס פרימיום מעוצב</option>
                     <option value="text">טקסט מהיר בלבד</option>
                  </select>
               </div>
               <div className="flex items-end pb-3 text-rose-300 text-[10px] font-black uppercase tracking-[0.4em] italic pr-2">
                  מצב שידור: {mode === 'card' ? 'RICH UI' : 'PLAIN TEXT'}
               </div>
            </div>

            {mode === 'text' ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                   <label className={labelStyles}>תוכן המסר</label>
                   <textarea 
                    value={plainText} 
                    onChange={(e) => setPlainText(e.target.value)} 
                    placeholder="כתבו כאן את המסר שלכם..." 
                    className="block w-full rounded-[2.5rem] border-rose-50 bg-white shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 min-h-[320px] p-8 text-sm leading-relaxed text-slate-800 placeholder:text-slate-200 font-medium" 
                   />
                </div>
            ) : (
                <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div>
                        <label className={labelStyles}>כותרת ראשית</label>
                        <input type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} className={inputStyles} placeholder="למשל: הודעת צוות חשובה" />
                      </div>
                      <div>
                        <label className={labelStyles}>תת-כותרת (פירוט)</label>
                        <input type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} className={inputStyles} placeholder="מידע נוסף..." />
                      </div>
                   </div>

                   <div className="bg-gradient-to-br from-rose-50/30 to-white rounded-[3rem] p-10 border border-white space-y-10 shadow-inner">
                      <div>
                        <label className={labelStyles}>גוף ההודעה המרכזי</label>
                        <textarea value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} className="block w-full rounded-[2rem] border-rose-50 bg-white shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50 min-h-[160px] p-8 text-sm text-slate-700 placeholder:text-slate-200 leading-relaxed font-medium" placeholder="תוכן המסר המלא יופיע כאן..." />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         <div>
                            <label className={labelStyles}>קישורי תמונות (אחד לשורה)</label>
                            <textarea value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} className="block w-full rounded-3xl border-rose-50 bg-white h-32 p-5 text-[11px] font-mono text-rose-400" placeholder="https://..." />
                         </div>
                         <div>
                            <label className={labelStyles}>כפתורי פעולה (טקסט|קישור)</label>
                            <textarea value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} className="block w-full rounded-3xl border-rose-50 bg-white h-32 p-5 text-[11px] font-mono text-amber-500" placeholder="כפתור|URL" />
                         </div>
                      </div>
                   </div>
                </div>
            )}

            <div className="pt-10">
               <div className="flex items-center gap-6 mb-10">
                  <div className="h-px bg-rose-100 flex-1" />
                  <span className="text-[11px] font-black text-rose-300 uppercase tracking-[0.5em]">תצוגה מקדימה ריאליסטית</span>
                  <div className="h-px bg-rose-100 flex-1" />
               </div>
               <div className="bg-white/50 rounded-[4rem] border-2 border-dashed border-rose-100 p-10 flex items-center justify-center min-h-[350px] shadow-inner relative overflow-hidden group">
                  {payload ? (
                    <div className="w-full max-w-xl animate-in zoom-in-95 duration-500 relative z-10">
                       {mode === 'text' ? (
                          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-rose-100/50 border border-rose-50 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">{plainText || 'ההודעה תופיע כאן...'}</div>
                       ) : (
                          <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-rose-100/50 border border-rose-50 overflow-hidden group/card hover:scale-[1.01] transition-transform duration-700">
                             {(cardData.title || cardData.subtitle) && (
                                <div className="p-8 border-b border-rose-50 bg-rose-50/20">
                                   <h3 className="font-black text-2xl text-slate-800 tracking-tight leading-tight font-rubik">{cardData.title}</h3>
                                   <p className="text-[12px] text-rose-500 font-black uppercase tracking-widest mt-2">{cardData.subtitle}</p>
                                </div>
                             )}
                             {cardData.headerImage && <img src={githubBlobToRaw(cardData.headerImage)} className="w-full object-cover max-h-64 group-hover/card:scale-110 transition-transform duration-[2000ms]" />}
                             <div className="p-10 space-y-8">
                                {cardData.cardText && <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{cardData.cardText}</p>}
                                {cardData.images.split('\n').filter(Boolean).map((img, i) => (
                                   <img key={i} src={githubBlobToRaw(img)} className="w-full rounded-[2.5rem] shadow-lg border border-rose-50" />
                                ))}
                                <div className="flex flex-wrap gap-4 pt-4">
                                   {cardData.actions.split('\n').map(a => a.split('|')).filter(p => p.length === 2).map(([t], i) => (
                                      <div key={i} className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[12px] font-black rounded-2xl shadow-xl shadow-indigo-100 uppercase tracking-[0.2em]">{t.trim()}</div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                  ) : (
                    <div className="text-rose-200 text-sm font-black uppercase tracking-[0.4em] animate-pulse italic">ממתין להזנת תוכן...</div>
                  )}
               </div>
            </div>
        </div>

        <footer className="pt-8 border-t border-rose-50 mt-auto flex flex-col sm:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-5 bg-white border border-rose-50 rounded-2xl p-4 px-8 text-[11px] font-black uppercase tracking-widest text-slate-400 flex-1 shadow-sm">
               <div className={`w-3.5 h-3.5 rounded-full ${isSending ? 'bg-amber-500 animate-ping' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'}`} />
               <span className="mt-0.5">{log}</span>
            </div>
            <button 
                onClick={handleSend}
                disabled={!payload || isSending}
                className="w-full sm:w-auto h-20 px-20 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-rose-200 hover:scale-[1.03] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-6 disabled:from-slate-200 disabled:to-slate-300 disabled:shadow-none disabled:scale-100 disabled:text-slate-400 uppercase tracking-tighter border border-white/40"
            >
                {isSending ? (
                    <div className="animate-spin h-8 w-8 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                )}
                <span>שדר עכשיו</span>
            </button>
        </footer>
    </div>
  );
}
