
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
                      className="block w-full rounded-xl border-2 border-slate-300 bg-white shadow-sm focus:border-indigo-600 transition-all pr-12 h-14 text-sm font-bold text-slate-900 placeholder:text-slate-400"
                      autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    className={`h-14 w-14 flex items-center justify-center rounded-xl border-2 transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-400 border-slate-300 hover:border-indigo-600 hover:text-indigo-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b-2 border-slate-200">
                        <span className="text-xs font-black text-slate-900 uppercase">יעדים שמורים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 font-bold italic">אין פריטים שמורים</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-3 hover:bg-indigo-50 border-b border-slate-100 last:border-0">
                                    <button onClick={() => { onSelect(w.url); setIsOpen(false); }} className="flex-1 text-right">
                                        <div className="font-bold text-slate-900">{w.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{w.url}</div>
                                    </button>
                                    <button onClick={() => onDelete(w.id)} className="p-2 text-red-300 hover:text-red-600"><TrashIcon /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
  const [log, setLog] = useState('המערכת מוכנה');
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
        setLog('ההודעה שוגרה בהצלחה!');
        saveHistory(payload, webhookUrl);
      } else setLog(`תקלה מצד השרת: ${res.status}`);
    } catch { setLog('שגיאת רשת - וודאו חיבור'); }
    finally { setIsSending(false); }
  };

  return (
    <div className="flex flex-col bg-white rounded-3xl p-8 lg:p-10 shadow-xl border-t-8 border-indigo-600 h-full overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pl-4 -ml-4 pr-1 space-y-8 pb-10">
            
            <section>
               <label className="label-high-contrast">כתובת ה-Webhook ליעד השידור</label>
               <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-2xl border-2 border-slate-100">
               <div>
                  <label className="label-high-contrast">סגנון ההפצה המבוקש</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="block w-full rounded-xl border-2 border-slate-300 bg-white h-14 px-6 font-bold text-slate-900 focus:border-indigo-600 transition-all">
                     <option value="card">כרטיס פרימיום מעוצב</option>
                     <option value="text">טקסט פשוט ומהיר</option>
                  </select>
               </div>
               <div className="flex items-center justify-center border-4 border-dashed border-slate-200 rounded-xl px-6 bg-white/50">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest italic">{mode === 'card' ? 'RICH EXPERIENCE' : 'RAW CONTENT'}</span>
               </div>
            </div>

            <div className="space-y-8">
               {mode === 'text' ? (
                   <div>
                      <label className="label-high-contrast">תוכן המסר להפצה</label>
                      <textarea 
                        value={plainText} 
                        onChange={(e) => setPlainText(e.target.value)} 
                        placeholder="כתבו כאן את המסר שלכם..." 
                        className="block w-full rounded-2xl border-2 border-slate-300 bg-white min-h-[300px] p-8 text-lg font-bold text-slate-900 focus:border-indigo-600"
                      />
                   </div>
               ) : (
                   <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div>
                            <label className="label-high-contrast">כותרת ראשית (Title)</label>
                            <input type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} className="block w-full rounded-xl border-2 border-slate-300 bg-white h-14 px-5 font-bold text-slate-900" />
                         </div>
                         <div>
                            <label className="label-high-contrast">תת-כותרת (Subtitle)</label>
                            <input type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} className="block w-full rounded-xl border-2 border-slate-300 bg-white h-14 px-5 font-bold text-slate-900" />
                         </div>
                      </div>
                      <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100 space-y-6">
                         <div>
                            <label className="label-high-contrast">גוף ההודעה המרכזי</label>
                            <textarea value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} className="block w-full rounded-xl border-2 border-slate-300 bg-white h-32 p-6 font-bold text-slate-800" />
                         </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                               <label className="label-high-contrast">קישורי תמונות (אחת לשורה)</label>
                               <textarea value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} className="block w-full rounded-xl border-2 border-slate-300 bg-white h-24 p-4 text-xs font-mono font-bold text-indigo-600" />
                            </div>
                            <div>
                               <label className="label-high-contrast">כפתורי פעולה (טקסט|קישור)</label>
                               <textarea value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} className="block w-full rounded-xl border-2 border-slate-300 bg-white h-24 p-4 text-xs font-mono font-bold text-rose-600" />
                            </div>
                         </div>
                      </div>
                   </div>
               )}
            </div>

            <div className="pt-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-1 bg-slate-900 flex-1" />
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest bg-white border-2 border-slate-950 px-6 py-2 rounded-full shadow-lg">תצוגה מקדימה</span>
                  <div className="h-1 bg-slate-900 flex-1" />
               </div>
               <div className="bg-slate-100 rounded-[3rem] border-4 border-dashed border-white p-10 flex items-center justify-center min-h-[400px] shadow-inner">
                  {payload ? (
                    <div className="w-full max-w-xl animate-in zoom-in-95 duration-300">
                       {mode === 'text' ? (
                          <div className="bg-white p-10 rounded-3xl shadow-xl border-2 border-white whitespace-pre-wrap text-lg font-bold text-slate-900">{plainText || 'ההודעה תופיע כאן...'}</div>
                       ) : (
                          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden">
                             {(cardData.title || cardData.subtitle) && (
                                <div className="p-8 bg-slate-50 border-b-2 border-slate-100">
                                   <h3 className="font-black text-2xl text-slate-950 leading-tight">{cardData.title}</h3>
                                   <p className="text-sm text-indigo-600 font-bold uppercase mt-2">{cardData.subtitle}</p>
                                </div>
                             )}
                             {cardData.headerImage && <img src={githubBlobToRaw(cardData.headerImage)} className="w-full object-cover max-h-64" />}
                             <div className="p-8 space-y-8">
                                {cardData.cardText && <p className="text-lg text-slate-900 leading-relaxed font-bold">{cardData.cardText}</p>}
                                {cardData.images.split('\n').filter(Boolean).map((img, i) => (
                                   <img key={i} src={githubBlobToRaw(img)} className="w-full rounded-2xl shadow-md border-2 border-white" />
                                ))}
                                <div className="flex flex-wrap gap-4 pt-4">
                                   {cardData.actions.split('\n').map(a => a.split('|')).filter(p => p.length === 2).map(([t], i) => (
                                      <div key={i} className="px-10 py-3 bg-slate-950 text-white text-xs font-black rounded-xl shadow-lg uppercase">{t.trim()}</div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-lg font-black uppercase italic animate-pulse tracking-widest">ממתין להזנת תוכן...</div>
                  )}
               </div>
            </div>
        </div>

        <footer className="pt-8 border-t-4 border-slate-100 mt-auto flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4 bg-slate-900 rounded-2xl p-4 px-8 text-white flex-1 shadow-lg w-full">
               <div className={`w-3 h-3 rounded-full ${isSending ? 'bg-yellow-400 animate-ping' : 'bg-green-400'}`} />
               <span className="text-xs font-black tracking-widest uppercase">{log}</span>
            </div>
            <button 
                onClick={handleSend} 
                disabled={!payload || isSending}
                className="w-full sm:w-auto h-20 px-24 bg-indigo-600 text-white rounded-2xl font-black text-3xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-5 disabled:bg-slate-300 border-b-8 border-indigo-900"
            >
                {isSending ? <div className="animate-spin h-10 w-10 border-4 border-white/30 border-t-white rounded-full" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                <span>שדר עכשיו</span>
            </button>
        </footer>
    </div>
  );
}
