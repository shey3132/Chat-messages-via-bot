
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChatMessagePayload, CardV2, SavedWebhook } from '../types';
import { emojiNames, emojiCategories } from '../data/emojis';

// --- SHARED WEBHOOK SELECTOR ---
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
                      className="block w-full rounded-2xl border-white/10 bg-white/5 shadow-inner focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all pr-12 h-14 text-sm text-slate-100 placeholder:text-slate-600"
                      autoComplete="off"
                    />
                    <button onClick={() => setIsOpen(!isOpen)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    className={`h-14 w-14 flex items-center justify-center rounded-2xl border transition-all ${isSaving ? 'bg-teal-600 text-white border-teal-600 shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-white/5 text-slate-500 border-white/10 hover:border-teal-500/50 hover:text-teal-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-4 bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-white/5 bg-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">וובוקים שמורים לסקרים</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-sm italic opacity-30">אין פריטים שמורים</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-2 hover:bg-white/5 group border-b border-white/5 last:border-0 mx-3 mt-1 first:mt-2 last:mb-2 rounded-2xl transition-colors">
                                    <button onClick={() => { onSelect(w.url); setIsOpen(false); }} className="flex-1 text-right px-4 py-2">
                                        <div className="font-black text-slate-100 text-sm tracking-tight">{w.name}</div>
                                        <div className="text-[10px] text-slate-600 truncate max-w-[250px] mt-1 font-mono">{w.url}</div>
                                    </button>
                                    <button onClick={() => onDelete(w.id)} className="p-3 text-slate-800 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-500/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {isSaving && (
                <div className="absolute z-50 left-0 mt-4 p-6 bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-teal-500/30 w-80 animate-in zoom-in duration-200">
                    <h4 className="text-sm font-black text-teal-400 mb-4 uppercase tracking-widest">שמירת יעד חדש</h4>
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="שם לסקר..." className="w-full text-sm rounded-xl border-white/10 bg-white/5 text-white focus:border-teal-500 mb-4 h-12 px-4" autoFocus />
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={!nickname.trim()} className="flex-1 bg-teal-600 text-white text-xs font-black py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50 uppercase tracking-widest shadow-[0_0_15px_rgba(20,184,166,0.3)]">שמור</button>
                        <button onClick={() => setIsSaving(false)} className="px-5 bg-white/5 text-slate-400 text-xs font-bold py-3 rounded-xl hover:bg-white/10">ביטול</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);

const FaceSmileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const inputStyles = "block w-full mt-2 rounded-2xl border-white/5 bg-white/5 shadow-inner focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm text-slate-100 px-5 h-12 placeholder:text-slate-700 font-medium";
const labelStyles = "block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 px-1";

interface EmojiPickerProps { onSelect: (emoji: string) => void; onClose: () => void; }

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
    const pickerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) onClose(); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
    const filteredEmojis = useMemo(() => {
      if (!searchQuery.trim()) return null;
      const query = searchQuery.trim().toLowerCase();
      return Object.entries(emojiNames).filter(([_, name]) => name.toLowerCase().includes(query)).map(([emoji]) => emoji);
    }, [searchQuery]);
    const renderEmojiButtons = (emojis: string[]) => (
         <div className="flex flex-row flex-wrap justify-start gap-1">
            {emojis.map(emoji => (
                <button key={emoji} onClick={() => onSelect(emoji)} title={emojiNames[emoji] || ''} className="w-10 h-10 text-2xl rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">{emoji}</button>
            ))}
        </div>
    );
    return (
        <div ref={pickerRef} className="absolute z-20 w-80 max-h-96 flex flex-col bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 mt-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <input type="text" placeholder="חיפוש אימוג'י..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-5 py-2.5 text-sm bg-slate-950/60 border border-white/5 rounded-xl focus:ring-2 focus:ring-teal-500/30 text-white placeholder:text-slate-700 outline-none" autoFocus />
            </div>
            <div className="overflow-y-auto p-4 custom-scrollbar">
                {filteredEmojis ? (filteredEmojis.length > 0 ? renderEmojiButtons(filteredEmojis) : <p className="w-full text-center text-xs text-slate-600 py-6 italic">אין תוצאות</p>) : (
                    emojiCategories.map(category => (
                        <div key={category.name} className="mb-4">
                            <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest sticky top-0 bg-slate-900/90 py-1 mb-2">{category.name}</h4>
                            <div className="mt-1">{renderEmojiButtons(category.emojis)}</div>
                        </div>
                    ))
                )}
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
  const [log, setLog] = useState('מוכן לשיגור');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [pickerOpenFor, setPickerOpenFor] = useState<number | null>(null);
  const [isQuestionPickerOpen, setQuestionPickerOpen] = useState(false);

  useEffect(() => { localStorage.setItem('last_webhook_url_poll', webhookUrl); }, [webhookUrl]);

  const payload = useMemo<ChatMessagePayload | null>(() => {
    const validOptions = options.filter(opt => opt.text.trim());
    if (!question.trim() || validOptions.length === 0) return null;
    return { cardsV2: [{ cardId: `poll-${Date.now()}`, card: { header: { title: question.trim() }, sections: [{ widgets: validOptions.map(opt => ({ decoratedText: { text: `${opt.emoji} ${opt.text.trim()}` } })) }] } }] };
  }, [question, options]);

  const handleSend = async () => {
    if (!webhookUrl.trim() || !payload) { setLog('שגיאה: חסר תוכן או יעד'); return; }
    setSendingState('sending');
    setLog('בשידור...');
    try {
      const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) { 
          setLog('הסקר שוגר!'); 
          saveHistory(payload, webhookUrl); 
          setSendingState('success'); 
          setTimeout(() => setSendingState('idle'), 2000); 
      }
      else { setLog(`תקלה: ${response.status}`); setSendingState('error'); }
    } catch { setLog('שגיאת רשת'); setSendingState('error'); }
  };

  return (
    <div className="flex flex-col bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-8 lg:p-10 shadow-2xl border border-white/10 h-full overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 pl-4 space-y-10 pb-10">
            <section>
                <label className={labelStyles}>יעד הסקר (Webhook)</label>
                <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </section>

            <div className="space-y-10 bg-white/[0.02] p-8 rounded-[3rem] border border-white/5 shadow-inner">
                <div>
                    <label className={labelStyles}>שאלת הסקר</label>
                    <div className="flex items-center gap-3 mt-2">
                        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="מה השאלה?" className="block flex-grow rounded-2xl border-white/5 bg-slate-950/40 focus:border-teal-500/40 transition-all text-sm text-slate-100 px-6 h-14 placeholder:text-slate-800 font-medium shadow-inner" />
                        <div className="relative">
                             <button onClick={() => setQuestionPickerOpen(!isQuestionPickerOpen)} className="h-14 w-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-teal-400 hover:border-teal-500/50 transition-all shadow-xl"><FaceSmileIcon /></button>
                             {isQuestionPickerOpen && <EmojiPicker onSelect={emoji => { setQuestion(prev => prev + emoji); setQuestionPickerOpen(false); }} onClose={() => setQuestionPickerOpen(false)} />}
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelStyles}>אפשרויות לבחירה</label>
                    <div className="space-y-4 mt-4">
                        {options.map((opt, idx) => (
                            <div key={opt.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="relative">
                                    <button onClick={() => setPickerOpenFor(pickerOpenFor === opt.id ? null : opt.id)} className="h-14 w-14 text-3xl bg-slate-950/40 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all shadow-inner">{opt.emoji}</button>
                                    {pickerOpenFor === opt.id && <EmojiPicker onSelect={e => { setOptions(options.map(o => o.id === opt.id ? {...o, emoji: e} : o)); setPickerOpenFor(null); }} onClose={() => setPickerOpenFor(null)} />}
                                </div>
                                <input type="text" value={opt.text} onChange={(e) => setOptions(options.map(o => o.id === opt.id ? {...o, text: e.target.value} : o))} placeholder={`אפשרות ${idx+1}...`} className="block flex-grow rounded-2xl border-white/5 bg-slate-950/40 focus:border-teal-500/40 transition-all text-sm text-slate-100 px-6 h-14 placeholder:text-slate-800 font-medium shadow-inner" />
                                <button onClick={() => setOptions(options.filter(o => o.id !== opt.id))} className="h-14 w-14 flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"><TrashIcon /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setOptions([...options, { id: nextId, emoji: '🤔', text: '' }]); setNextId(nextId + 1); }} className="mt-6 text-xs font-black text-teal-500 hover:text-teal-400 uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform">
                        <span>+ הוסף אפשרות חדשה</span>
                    </button>
                </div>
            </div>

            <div className="pt-6">
                <div className="flex items-center gap-6 mb-6">
                   <div className="h-px bg-white/5 flex-1" />
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Survey Preview</span>
                   <div className="h-px bg-white/5 flex-1" />
                </div>
                <div className="bg-slate-950/40 rounded-[3rem] border-2 border-dashed border-white/5 p-8 flex items-center justify-center min-h-[200px] shadow-inner">
                    {payload ? (
                      <div className="w-full max-w-lg animate-in zoom-in-95 duration-500">
                        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
                            <div className="p-8 font-black text-xl text-white tracking-tight leading-tight">{payload.cardsV2![0].card.header?.title}</div>
                            <div className="border-t border-white/5 p-8 space-y-3 bg-white/[0.01]">
                                {payload.cardsV2![0].card.sections[0].widgets.map((w, i) => (
                                    <div key={i} className="rounded-2xl bg-white/5 p-5 text-slate-300 font-bold border border-white/5 shadow-inner hover:bg-white/10 transition-colors">
                                        {w.decoratedText.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                    ) : (
                        <div className="text-slate-700 text-sm font-black uppercase tracking-widest animate-pulse">Waiting for poll content...</div>
                    )}
                </div>
            </div>

            <div className="pt-6">
                <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 text-[10px] font-mono text-slate-600 max-h-32 overflow-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                    <span className="text-teal-500/50 mr-2 opacity-50 font-black">LOG:</span>
                    {log}
                </div>
            </div>
        </div>

        <footer className="pt-8 border-t border-white/5 mt-auto">
            <button 
                onClick={handleSend} 
                disabled={!payload || sendingState === 'sending'} 
                className="w-full h-16 bg-teal-600 text-white rounded-2xl font-black text-xl shadow-[0_15px_35px_rgba(20,184,166,0.3)] hover:bg-teal-500 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 disabled:bg-slate-800 disabled:shadow-none disabled:scale-100 disabled:text-slate-600 uppercase tracking-tighter"
            >
                {sendingState === 'sending' ? <SpinnerIcon/> : <SendIcon/>}
                <span>{sendingState === 'sending' ? 'בשידור...' : 'שגר סקר עכשיו'}</span>
            </button>
        </footer>
    </div>
  );
}
