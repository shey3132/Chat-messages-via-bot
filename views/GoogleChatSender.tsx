
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
                      placeholder="הדבק Webhook URL..." 
                      className="block w-full rounded-2xl border-white/10 bg-white/5 shadow-inner focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all pr-12 h-14 text-sm text-slate-100 placeholder:text-slate-600"
                      autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    className={`h-14 w-14 flex items-center justify-center rounded-2xl border transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-white/5 text-slate-500 border-white/10 hover:border-indigo-500/50 hover:text-indigo-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-4 bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">וובוקים שמורים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-12 text-center opacity-30 italic text-slate-400">אין פריטים שמורים</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-3 hover:bg-white/5 group border-b border-white/5 last:border-0 mx-3 transition-colors rounded-2xl mt-1 first:mt-2 last:mb-2">
                                    <button 
                                        onClick={() => { onSelect(w.url); setIsOpen(false); }}
                                        className="flex-1 text-right px-4 py-2"
                                    >
                                        <div className="font-black text-slate-100 text-sm tracking-tight">{w.name}</div>
                                        <div className="text-[10px] text-slate-500 truncate max-w-[300px] mt-1 font-mono">{w.url}</div>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(w.id)}
                                        className="p-3 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-500/10"
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
                <div className="absolute z-50 left-0 mt-4 p-6 bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-indigo-500/30 w-80 animate-in zoom-in-95 duration-200">
                    <h4 className="text-sm font-black text-indigo-400 mb-4 uppercase tracking-widest">שמירת יעד חדש</h4>
                    <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="שם לזיהוי..."
                        className="w-full text-sm rounded-xl border-white/10 bg-white/5 text-white focus:border-indigo-500 mb-4 h-12 px-4"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSave}
                            disabled={!nickname.trim()}
                            className="flex-1 bg-indigo-600 text-white text-xs font-black py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 uppercase tracking-widest shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                            שמור
                        </button>
                        <button 
                            onClick={() => setIsSaving(false)}
                            className="px-5 bg-white/5 text-slate-400 text-xs font-bold py-3 rounded-xl hover:bg-white/10"
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

const inputStyles = "block w-full mt-2 rounded-2xl border-white/5 bg-white/5 shadow-inner focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm text-slate-100 px-5 h-12 placeholder:text-slate-700 font-medium";
const labelStyles = "block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 px-1";

export default function GoogleChatSender({ saveHistory, savedWebhooks, onAddWebhook, onDeleteWebhook }: any) {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => localStorage.getItem('last_webhook_url') || '');
  const [mode, setMode] = useState<'text' | 'card'>('card');
  const [plainText, setPlainText] = useState('');
  const [cardData, setCardData] = useState({ title: '', subtitle: '', headerImage: '', cardText: '', images: '', actions: '' });
  const [log, setLog] = useState('מוכן לשליחה');
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
    if (!webhookUrl.trim() || !payload) return setLog('שגיאה: חסר תוכן או כתובת');
    setIsSending(true);
    setLog('בשידור...');
    try {
      const res = await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        setLog('שוגר בהצלחה!');
        saveHistory(payload, webhookUrl);
      } else setLog(`תקלה: ${res.status}`);
    } catch { setLog('שגיאת רשת'); }
    finally { setIsSending(false); }
  };

  return (
    <div className="flex flex-col bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-8 lg:p-10 shadow-2xl border border-white/10 h-full overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pl-4 -ml-4 pr-1 space-y-10 pb-10">
            
            <section>
               <label className={labelStyles}>יעד ההפצה</label>
               <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5">
               <div>
                  <label className={labelStyles}>סגנון הודעה</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className={inputStyles}>
                     <option value="card" className="bg-slate-900 text-white">כרטיס מעוצב (Card v2)</option>
                     <option value="text" className="bg-slate-900 text-white">טקסט בלבד</option>
                  </select>
               </div>
               <div className="flex items-end pb-3 text-slate-500 text-[9px] font-black uppercase tracking-widest italic pr-2">
                  פורמט: {mode === 'card' ? 'Interactive Card' : 'Plain Text'}
               </div>
            </div>

            {mode === 'text' ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                   <label className={labelStyles}>תוכן חופשי</label>
                   <textarea 
                    value={plainText} 
                    onChange={(e) => setPlainText(e.target.value)} 
                    placeholder="הקלד כאן את ההודעה שלך..." 
                    className="block w-full rounded-[2.5rem] border-white/5 bg-white/5 shadow-inner focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 min-h-[300px] p-8 text-sm leading-relaxed text-slate-100 placeholder:text-slate-700" 
                   />
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className={labelStyles}>כותרת כרטיס</label>
                        <input type="text" value={cardData.title} onChange={(e) => setCardData({...cardData, title: e.target.value})} className={inputStyles} placeholder="כותרת בולטת..." />
                      </div>
                      <div>
                        <label className={labelStyles}>תת-כותרת</label>
                        <input type="text" value={cardData.subtitle} onChange={(e) => setCardData({...cardData, subtitle: e.target.value})} className={inputStyles} placeholder="פירוט קצר..." />
                      </div>
                   </div>

                   <div>
                      <label className={labelStyles}>באנר עליון (URL)</label>
                      <input type="text" value={cardData.headerImage} onChange={(e) => setCardData({...cardData, headerImage: e.target.value})} className={inputStyles} placeholder="https://..." />
                   </div>

                   <div className="bg-white/[0.03] rounded-[3rem] p-8 border border-white/5 space-y-8 shadow-inner">
                      <div>
                        <label className={labelStyles}>גוף ההודעה (Text Paragraph)</label>
                        <textarea value={cardData.cardText} onChange={(e) => setCardData({...cardData, cardText: e.target.value})} className="block w-full rounded-[2rem] border-white/5 bg-slate-950/40 focus:border-indigo-500/30 focus:ring-0 min-h-[140px] p-6 text-sm text-slate-200 placeholder:text-slate-800" placeholder="כאן כותבים את הסיפור..." />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div>
                            <label className={labelStyles}>תמונות גלריה (אחת לשורה)</label>
                            <textarea value={cardData.images} onChange={(e) => setCardData({...cardData, images: e.target.value})} className="block w-full rounded-2xl border-white/5 bg-slate-950/40 focus:border-indigo-500/30 h-28 p-4 text-[10px] font-mono text-indigo-400 placeholder:text-slate-800" placeholder="https://..." />
                         </div>
                         <div>
                            <label className={labelStyles}>כפתורי פעולה (טקסט|קישור)</label>
                            <textarea value={cardData.actions} onChange={(e) => setCardData({...cardData, actions: e.target.value})} className="block w-full rounded-2xl border-white/5 bg-slate-950/40 focus:border-indigo-500/30 h-28 p-4 text-[10px] font-mono text-teal-400 placeholder:text-slate-800" placeholder="לפרטים|https://..." />
                         </div>
                      </div>
                   </div>
                </div>
            )}

            <div className="pt-6">
               <div className="flex items-center gap-6 mb-6">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Preview Layer</span>
                  <div className="h-px bg-white/5 flex-1" />
               </div>
               <div className="bg-slate-950/40 rounded-[3rem] border-2 border-dashed border-white/5 p-8 flex items-center justify-center min-h-[250px] shadow-inner">
                  {payload ? (
                    <div className="w-full max-w-xl animate-in zoom-in-95 duration-500">
                       {mode === 'text' ? (
                          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-white/5 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{plainText || 'ההודעה תופיע כאן...'}</div>
                       ) : (
                          <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
                             {(cardData.title || cardData.subtitle) && (
                                <div className="p-6 border-b border-white/5 bg-white/5">
                                   <h3 className="font-black text-xl text-white tracking-tight leading-tight">{cardData.title}</h3>
                                   <p className="text-[11px] text-indigo-400 font-black uppercase tracking-widest mt-1">{cardData.subtitle}</p>
                                </div>
                             )}
                             {cardData.headerImage && <img src={githubBlobToRaw(cardData.headerImage)} className="w-full object-cover max-h-56" />}
                             <div className="p-8 space-y-6">
                                {cardData.cardText && <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{cardData.cardText}</p>}
                                {cardData.images.split('\n').filter(Boolean).map((img, i) => (
                                   <img key={i} src={githubBlobToRaw(img)} className="w-full rounded-3xl shadow-lg border border-white/5" />
                                ))}
                                <div className="flex flex-wrap gap-3 pt-2">
                                   {cardData.actions.split('\n').map(a => a.split('|')).filter(p => p.length === 2).map(([t], i) => (
                                      <div key={i} className="px-6 py-2.5 bg-indigo-600 text-white text-[11px] font-black rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] uppercase tracking-widest">{t.trim()}</div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                  ) : (
                    <div className="text-slate-700 text-sm font-black uppercase tracking-widest animate-pulse">Waiting for content...</div>
                  )}
               </div>
            </div>
        </div>

        <footer className="pt-8 border-t border-white/5 mt-auto flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 px-6 text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-white/5 flex-1 shadow-inner">
               <div className={`w-2 h-2 rounded-full ${isSending ? 'bg-amber-500 animate-ping' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'}`} />
               {log}
            </div>
            <button 
                onClick={handleSend}
                disabled={!payload || isSending}
                className="w-full sm:w-auto h-16 px-14 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-[0_15px_35px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 disabled:bg-slate-800 disabled:shadow-none disabled:scale-100 disabled:text-slate-600 uppercase tracking-tighter"
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
