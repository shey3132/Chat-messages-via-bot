
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChatMessagePayload, CardV2, SavedWebhook } from '../types';
import { emojiNames, emojiCategories } from '../data/emojis';

interface WebhookSelectorProps {
  currentUrl: string;
  onSelect: (url: string) => void;
  savedWebhooks: SavedWebhook[];
  onAdd: (webhook: SavedWebhook) => void;
  onDelete: (id: string) => void;
}

const WebhookSelector: React.FC<WebhookSelectorProps> = ({ currentUrl, onSelect, savedWebhooks, onAdd, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative w-full">
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <input 
                      type="text" 
                      value={currentUrl} 
                      onChange={(e) => onSelect(e.target.value)} 
                      placeholder="הדבק Webhook URL..." 
                      className="block w-full rounded-xl border border-indigo-50 bg-white shadow-sm focus:border-indigo-500 transition-all pr-10 h-10 text-xs font-semibold"
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <button onClick={() => setIsOpen(!isOpen)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-indigo-50 overflow-hidden animate-fade">
                    <div className="p-2.5 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-2">יעדי סקרים שמורים ({savedWebhooks.length})</span>
                    </div>
                    <div className="max-h-52 overflow-y-auto custom-scrollbar">
                        {savedWebhooks.length === 0 ? <div className="p-8 text-center text-slate-300 text-[10px] italic">אין פריטים</div> : savedWebhooks.map(w => (
                            <div key={w.id} className="flex items-center justify-between p-2 hover:bg-indigo-50 mx-2 rounded-lg my-1 transition-colors">
                                <button onClick={() => { onSelect(w.url); setIsOpen(false); }} className="flex-1 text-right px-2">
                                    <div className="font-bold text-slate-800 text-xs tracking-tight">{w.name}</div>
                                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{w.url}</div>
                                </button>
                                <button onClick={() => onDelete(w.id)} className="p-2 text-slate-200 hover:text-red-500"><TrashIcon/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const EmojiPicker: React.FC<{onSelect: (emoji: string) => void; onClose: () => void}> = ({ onSelect, onClose }) => {
    const pickerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) onClose(); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
    return (
        <div ref={pickerRef} className="absolute z-50 w-64 max-h-72 flex flex-col bg-white rounded-2xl shadow-2xl border border-indigo-50 mt-2 overflow-hidden animate-fade">
            <div className="overflow-y-auto p-3 custom-scrollbar">
                {emojiCategories.map(category => (
                    <div key={category.name} className="mb-3">
                        <h4 className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">{category.name}</h4>
                        <div className="flex flex-wrap gap-1">
                            {category.emojis.map(emoji => (
                                <button key={emoji} onClick={() => onSelect(emoji)} title={emojiNames[emoji] || ''} className="w-8 h-8 text-xl rounded-lg hover:bg-indigo-50 transition-all flex items-center justify-center">{emoji}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface PollOption { id: number; emoji: string; text: string; }

export default function OtherApp({ saveHistory, savedWebhooks, onAddWebhook, onDeleteWebhook }: any) {
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('last_webhook_url_poll') || '');
  const [question, setQuestion] = useState('מה דעתכם בנושא?');
  const [options, setOptions] = useState<PollOption[]>([{ id: 1, emoji: '👍', text: 'בעד' }, { id: 2, emoji: '👎', text: 'נגד' }]);
  const [nextId, setNextId] = useState(3);
  const [log, setLog] = useState('מערכת הסקרים מוכנה');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [pickerOpenFor, setPickerOpenFor] = useState<number | null>(null);

  useEffect(() => { localStorage.setItem('last_webhook_url_poll', webhookUrl); }, [webhookUrl]);

  const payload = useMemo<ChatMessagePayload | null>(() => {
    const validOptions = options.filter(opt => opt.text.trim());
    if (!question.trim() || validOptions.length === 0) return null;
    return { cardsV2: [{ cardId: `poll-${Date.now()}`, card: { header: { title: question.trim() }, sections: [{ widgets: validOptions.map(opt => ({ decoratedText: { text: `${opt.emoji} ${opt.text.trim()}` } })) }] } }] };
  }, [question, options]);

  const handleSend = async () => {
    if (!webhookUrl.trim() || !payload) return setLog('שגיאה: חסר תוכן או יעד');
    setSendingState('sending');
    setLog('משדר סקר...');
    try {
      const res = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setLog('הסקר פורסם בהצלחה!'); saveHistory(payload, webhookUrl); setSendingState('success'); setTimeout(() => setSendingState('idle'), 2000); }
      else { setLog(`תקלה: ${res.status}`); setSendingState('error'); }
    } catch { setLog('שגיאת רשת'); setSendingState('error'); }
  };

  const inputClasses = "block w-full mt-1 rounded-xl border border-indigo-50 bg-white shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-xs h-10 px-4 font-semibold outline-none";

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm overflow-hidden animate-fade">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-6 pb-4">
            <section>
                <label className="field-label">יעד ה-Webhook</label>
                <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="space-y-6 bg-indigo-50/20 p-5 rounded-xl border border-indigo-50">
                <div>
                    <label className="field-label">שאלת הסקר</label>
                    <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="כתבו כאן את השאלה..." className={inputClasses} />
                </div>
                <div>
                    <label className="field-label">אפשרויות</label>
                    <div className="space-y-2.5 mt-2">
                        {options.map((opt, idx) => (
                            <div key={opt.id} className="flex items-center gap-2 group">
                                <div className="relative">
                                    <button onClick={() => setPickerOpenFor(pickerOpenFor === opt.id ? null : opt.id)} className="h-10 w-10 text-xl bg-white border border-indigo-50 rounded-xl flex items-center justify-center hover:border-indigo-400 transition-all shadow-sm">{opt.emoji}</button>
                                    {pickerOpenFor === opt.id && <EmojiPicker onSelect={e => { setOptions(options.map(o => o.id === opt.id ? {...o, emoji: e} : o)); setPickerOpenFor(null); }} onClose={() => setPickerOpenFor(null)} />}
                                </div>
                                <input type="text" value={opt.text} onChange={(e) => setOptions(options.map(o => o.id === opt.id ? {...o, text: e.target.value} : o))} placeholder={`אפשרות ${idx+1}...`} className={inputClasses} />
                                <button onClick={() => setOptions(options.filter(o => o.id !== opt.id))} className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><TrashIcon/></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setOptions([...options, { id: nextId, emoji: '🤔', text: '' }]); setNextId(nextId + 1); }} className="mt-3 text-[10px] font-black text-indigo-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2">+ הוסף אפשרות</button>
                </div>
            </div>

            <section>
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest whitespace-nowrap">תצוגה מקדימה</span>
                    <div className="h-px bg-indigo-50 flex-1" />
                </div>
                <div className="bg-indigo-50/40 rounded-2xl p-6 min-h-[150px] flex items-center justify-center border border-dashed border-indigo-100 shadow-inner">
                    {payload ? (
                      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
                          <div className="p-4 bg-indigo-50/30 border-b border-indigo-100 font-bold text-slate-800 text-sm">{payload.cardsV2![0].card.header?.title}</div>
                          <div className="p-4 space-y-2.5">
                              {payload.cardsV2![0].card.sections[0].widgets.map((w, i) => (
                                  <div key={i} className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-xs font-semibold text-slate-700">{w.decoratedText.text}</div>
                              ))}
                          </div>
                      </div>
                    ) : <span className="text-indigo-200 text-[10px] font-black uppercase italic animate-pulse">ממתין לתוכן...</span>}
                </div>
            </section>
        </div>

        <footer className="pt-4 border-t border-indigo-50 mt-3">
            <button onClick={handleSend} disabled={!payload || sendingState === 'sending'} className="w-full h-11 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                {sendingState === 'sending' ? <div className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                <span>{sendingState === 'sending' ? 'משדר סקר...' : 'שגר סקר עכשיו'}</span>
            </button>
        </footer>
    </div>
  );
}
