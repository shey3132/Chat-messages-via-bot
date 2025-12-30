
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
                      placeholder="הדבק Webhook URL ליעד השידור..." 
                      className="block w-full rounded-2xl border-2 border-slate-100 bg-white shadow-sm focus:border-indigo-400 transition-all pr-12 h-14 text-sm font-bold"
                      autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button onClick={() => setIsOpen(!isOpen)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    className={`h-14 w-14 flex items-center justify-center rounded-2xl border-2 transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-400 hover:text-indigo-600 shadow-sm'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-ready">
                    <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center px-6">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">יעדים שמורים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-10 text-center text-slate-300 text-sm font-bold italic">אין יעדים שמורים</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-3 hover:bg-indigo-50/50 group mx-4 rounded-xl my-2 border border-transparent hover:border-indigo-100 transition-all">
                                    <button onClick={() => { onSelect(w.url); setIsOpen(false); }} className="flex-1 text-right px-2">
                                        <div className="font-bold text-slate-800 text-sm tracking-tight">{w.name}</div>
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
                <div className="absolute z-50 left-0 mt-3 p-6 bg-white rounded-3xl shadow-2xl border border-indigo-100 w-80 animate-ready">
                    <label className="field-label">תן שם ליעד</label>
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="למשל: צוות פיתוח..." className="w-full text-sm rounded-xl border-2 border-slate-100 bg-slate-50 h-11 px-4 mb-4 font-bold" autoFocus />
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={!nickname.trim()} className="flex-1 bg-indigo-600 text-white text-[10px] font-black py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 uppercase tracking-widest shadow-lg">שמור יעד</button>
                        <button onClick={() => setIsSaving(false)} className="px-5 bg-slate-100 text-slate-500 text-[10px] font-black py-3 rounded-xl hover:bg-slate-200 uppercase tracking-widest">ביטול</button>
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
    setLog('מבצע שידור...');
    try {
      const res = await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        setLog('שוגר בהצלחה!');
        saveHistory(payload, webhookUrl);
      } else setLog(`תקלה: ${res.status}`);
    } catch { setLog('שגיאת רשת'); }
    finally { setIsSending(false); }
  };

  const inputClasses = "block w-full mt-1 rounded-2xl border-2 border-slate-100 bg-white shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm h-12 px-5 font-bold outline-none";

  return (
    <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 space-y-8 pb-4">
            
            <section>
               <label className="field-label">יעד ה-Webhook ליעד</label>
               <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100">
               <div>
                  <label className="field-label">סגנון הפצה</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className={inputClasses}>
                     <option value="card">כרטיס מעוצב עשיר</option>
                     <option value="text">טקסט פשוט ומהיר</option>
                  </select>
               </div>
               <div className="flex items-center justify-center border-4 border-dashed border-white rounded-[1.5rem] bg-indigo-600/5 px-6 text-[11px] font-black text-indigo-500 tracking-[0.2em] uppercase">
                  MODE: {mode.toUpperCase()}
               </div>
            </div>

            <div className="space-y-6 animate-ready">
               {mode === 'text' ? (
                   <div>
                      <label className="field-label">תוכן ההודעה להפצה</label>
                      <textarea 
                        value={plainText} 
                        onChange={(e) => setPlainText(e.target.value)} 
                        placeholder="כתבו כאן את המסר שלכם..." 
                        className="block w-full rounded-[2rem] border-2 border-slate-100 bg-white min-h-[150px] p-8 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                      />
                   </div>
               ) : (
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="field-label">כותרת ראשית (Title)</label>
                            <input type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} className={inputClasses} />
                         </div>
                         <div>
                            <label className="field-label">תת-כותרת (Subtitle)</label>
                            <input type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} className={inputClasses} />
                         </div>
                      </div>
                      <div className="bg-indigo-50/20 p-6 rounded-[2rem] border border-indigo-100 space-y-5">
                         <div>
                            <label className="field-label">גוף הכרטיס המרכזי</label>
                            <textarea value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} className="block w-full rounded-2xl border-2 border-white bg-white/60 h-24 p-5 text-sm font-bold outline-none focus:border-indigo-400 transition-all" />
                         </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                               <label className="field-label">תמונות (אחת לשורה)</label>
                               <textarea value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} className="block w-full rounded-xl border-2 border-white bg-white/60 h-20 p-4 text-[10px] font-mono font-bold" />
                            </div>
                            <div>
                               <label className="field-label">כפתורים (טקסט|URL)</label>
                               <textarea value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} className="block w-full rounded-xl border-2 border-white bg-white/60 h-20 p-4 text-[10px] font-mono font-bold" />
                            </div>
                         </div>
                      </div>
                   </div>
               )}
            </div>

            <section>
                <div className="flex items-center gap-4 mb-4 px-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">תצוגה מקדימה</span>
                    <div className="h-px bg-slate-100 flex-1" />
                </div>
                <div className="bg-slate-100/50 border-4 border-dashed border-white rounded-[3rem] p-8 min-h-[200px] flex items-center justify-center shadow-inner">
                    {payload ? (
                      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-ready">
                        {mode === 'text' ? (
                           <div className="p-8 text-sm font-bold text-slate-700 whitespace-pre-wrap leading-relaxed">{plainText || 'ממתין לתוכן...'}</div>
                        ) : (
                           <div>
                              {(cardData.title || cardData.subtitle) && (
                                 <div className="p-6 bg-slate-50 border-b border-slate-100">
                                    <div className="font-black text-slate-900 text-xl tracking-tight leading-tight">{cardData.title}</div>
                                    <div className="text-[11px] text-indigo-600 font-black uppercase mt-1 tracking-widest">{cardData.subtitle}</div>
                                 </div>
                              )}
                              <div className="p-8 space-y-6 text-sm text-slate-700 font-bold leading-relaxed">
                                 {cardData.cardText && <div className="whitespace-pre-wrap">{cardData.cardText}</div>}
                                 {cardData.images.split('\n').filter(Boolean).map((img, i) => <img key={i} src={githubBlobToRaw(img)} className="w-full rounded-2xl border-4 border-white shadow-md" />)}
                                 <div className="flex flex-wrap gap-3 pt-2">
                                    {cardData.actions.split('\n').map(a => a.split('|')).filter(p => p.length === 2).map(([t], i) => (
                                       <div key={i} className="px-6 py-2 bg-slate-950 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg">{t.trim()}</div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs font-black uppercase tracking-[0.3em] italic animate-pulse">Waiting for content...</span>
                    )}
                </div>
            </section>
        </div>

        <footer className="pt-6 border-t border-slate-100 mt-4 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-4 bg-slate-900 px-8 h-14 rounded-2xl flex-1 text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-xl">
               <div className={`w-3 h-3 rounded-full ${isSending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
               {log}
            </div>
            <button 
                onClick={handleSend} 
                disabled={!payload || isSending}
                className="h-14 px-16 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-4 disabled:bg-slate-300 border-b-4 border-indigo-900"
            >
                {isSending ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                <span className="tracking-widest uppercase">שדר עכשיו</span>
            </button>
        </footer>
    </div>
  );
}
