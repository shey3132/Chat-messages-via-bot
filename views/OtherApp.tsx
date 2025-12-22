
import React, { useState, useCallback, useRef, useEffect, ChangeEvent, useMemo } from 'react';
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
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={currentUrl} 
                      onChange={(e) => onSelect(e.target.value)} 
                      placeholder="הדבק כאן כתובת Webhook..." 
                      className="block w-full rounded-lg border-slate-300 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition duration-150 ease-in-out pr-10"
                      autoComplete="off"
                    />
                    <button onClick={() => setIsOpen(!isOpen)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setIsSaving(!isSaving)}
                    title="שמור וובוק זה"
                    className={`p-2 rounded-lg border transition-all ${isSaving ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">וובוקים שמורים</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {savedWebhooks.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-sm italic">אין וובוקים שמורים עדיין</div>
                        ) : (
                            savedWebhooks.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-1 hover:bg-slate-50 group">
                                    <button onClick={() => { onSelect(w.url); setIsOpen(false); }} className="flex-1 text-right px-3 py-2">
                                        <div className="font-bold text-slate-800 text-sm">{w.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[250px]">{w.url}</div>
                                    </button>
                                    <button onClick={() => onDelete(w.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {isSaving && (
                <div className="absolute z-50 left-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-indigo-100 w-64 animate-in zoom-in duration-200">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">כינוי לוובוק</label>
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="כינוי לסקרים..." className="w-full text-sm rounded-lg border-slate-200 focus:border-indigo-500 mb-3" autoFocus />
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={!nickname.trim()} className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">שמור</button>
                        <button onClick={() => setIsSaving(false)} className="px-3 bg-slate-100 text-slate-500 text-xs font-bold py-2 rounded-lg hover:bg-slate-200">ביטול</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- REST OF THE COMPONENT ---

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);

const FaceSmileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const commonInputClasses = "block w-full mt-1 rounded-lg border-slate-300 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm";
const labelClasses = "block text-sm font-medium text-slate-600";

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
                <button key={emoji} onClick={() => onSelect(emoji)} title={emojiNames[emoji] || ''} className="w-9 h-9 text-2xl rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center">{emoji}</button>
            ))}
        </div>
    );
    return (
        <div ref={pickerRef} className="absolute z-20 w-80 max-h-96 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 mt-2">
            <div className="p-2 border-b border-slate-200"><input type="text" placeholder="חיפוש אימוג'י..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-400 focus:outline-none" autoFocus /></div>
            <div className="overflow-y-auto p-2">
                {filteredEmojis ? (filteredEmojis.length > 0 ? renderEmojiButtons(filteredEmojis) : <p className="w-full text-center text-sm text-slate-500 py-4">לא נמצאו תוצאות</p>) : (
                    emojiCategories.map(category => (
                        <div key={category.name} className="mb-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase sticky top-0 bg-white/80 backdrop-blur-sm py-1">{category.name}</h4>
                            <div className="mt-1">{renderEmojiButtons(category.emojis)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

interface OtherAppProps {
    saveHistory: (payload: ChatMessagePayload, webhookUrl: string) => void;
    savedWebhooks: SavedWebhook[];
    onAddWebhook: (webhook: SavedWebhook) => void;
    onDeleteWebhook: (id: string) => void;
}

interface PollOption { id: number; emoji: string; text: string; }

export default function OtherApp({ saveHistory, savedWebhooks, onAddWebhook, onDeleteWebhook }: OtherAppProps) {
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('last_webhook_url') || '');
  const [question, setQuestion] = useState('מה דעתכם בנושא?');
  const [options, setOptions] = useState<PollOption[]>([{ id: 1, emoji: '👍', text: 'בעד' }, { id: 2, emoji: '👎', text: 'נגד' }]);
  const [nextId, setNextId] = useState(3);
  const [log, setLog] = useState('מוכן.');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [pickerOpenFor, setPickerOpenFor] = useState<number | null>(null);
  const [isQuestionPickerOpen, setQuestionPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { localStorage.setItem('last_webhook_url', webhookUrl); }, [webhookUrl]);

  const payload = useMemo<ChatMessagePayload | null>(() => {
    const validOptions = options.filter(opt => opt.text.trim());
    if (!question.trim() || validOptions.length === 0) return null;
    return { cardsV2: [{ cardId: `poll-${Date.now()}`, card: { header: { title: question.trim() }, sections: [{ widgets: validOptions.map(opt => ({ decoratedText: { text: `${opt.emoji} ${opt.text.trim()}` } })) }] } }] };
  }, [question, options]);

  const handleSend = async () => {
    if (!webhookUrl.trim() || !payload) { setLog('שגיאה: חסרים נתונים.'); return; }
    setSendingState('sending');
    try {
      const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) { 
          setLog('הסקר נשלח!'); 
          saveHistory(payload, webhookUrl); 
          setSendingState('success'); 
          setTimeout(() => setSendingState('idle'), 2000); 
      }
      else { setLog('שגיאה בשליחה.'); setSendingState('error'); }
    } catch { setLog('שגיאת רשת.'); setSendingState('error'); }
  };

  return (
    <div className="flex flex-col bg-white/70 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 h-full">
        <header className="flex items-center gap-3 mb-6">
            <div className="bg-teal-100 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
            <h1 className="text-3xl font-bold text-slate-800">מחולל סקרים</h1>
        </header>
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 pl-4 space-y-6">
            <div>
                <label className={labelClasses}>Webhook URL</label>
                <WebhookSelector currentUrl={webhookUrl} onSelect={setWebhookUrl} savedWebhooks={savedWebhooks} onAdd={onAddWebhook} onDelete={onDeleteWebhook} />
            </div>
            <div className="space-y-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
                <div>
                    <label className={labelClasses}>שאלת הסקר</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="מה השאלה?" className={`${commonInputClasses} mt-0 flex-grow`} />
                        <div className="relative">
                             <button onClick={() => setQuestionPickerOpen(!isQuestionPickerOpen)} className="w-10 h-10 bg-white border border-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-100 transition"><FaceSmileIcon /></button>
                             {isQuestionPickerOpen && <EmojiPicker onSelect={emoji => { setQuestion(prev => prev + emoji); setQuestionPickerOpen(false); }} onClose={() => setQuestionPickerOpen(false)} />}
                        </div>
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>אפשרויות</label>
                    <div className="space-y-2 mt-2">
                        {options.map((opt, idx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                                <div className="relative">
                                    <button onClick={() => setPickerOpenFor(pickerOpenFor === opt.id ? null : opt.id)} className="w-10 h-10 text-2xl bg-white border border-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-100 transition">{opt.emoji}</button>
                                    {pickerOpenFor === opt.id && <EmojiPicker onSelect={e => { setOptions(options.map(o => o.id === opt.id ? {...o, emoji: e} : o)); setPickerOpenFor(null); }} onClose={() => setPickerOpenFor(null)} />}
                                </div>
                                <input type="text" value={opt.text} onChange={(e) => setOptions(options.map(o => o.id === opt.id ? {...o, text: e.target.value} : o))} placeholder={`אפשרות ${idx+1}`} className={`${commonInputClasses} mt-0`} />
                                <button onClick={() => setOptions(options.filter(o => o.id !== opt.id))} className="p-2 text-slate-400 hover:text-red-600 rounded-full transition-colors"><TrashIcon /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setOptions([...options, { id: nextId, emoji: '🤔', text: '' }]); setNextId(nextId + 1); }} className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800">+ הוסף אפשרות</button>
                </div>
            </div>
            <div className="pt-4">
                <div className="flex justify-between items-center"><label className={labelClasses}>תצוגה מקדימה</label></div>
                <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-4 min-h-[150px] bg-slate-100/50">
                    {payload ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm w-full text-sm">
                          <div className="p-2 font-bold text-slate-900">{payload.cardsV2![0].card.header?.title}</div>
                          <div className="border-t border-slate-200 p-2 space-y-1">{payload.cardsV2![0].card.sections[0].widgets.map((w, i) => <div key={i} className="rounded-md bg-slate-100 p-2">{w.decoratedText.text}</div>)}</div>
                      </div>
                    ) : <div className="grid place-content-center h-full text-slate-500">התצוגה תופיע כאן</div>}
                </div>
            </div>
            <div><pre className="p-4 bg-slate-800 text-slate-200 text-xs rounded-lg h-20 overflow-auto whitespace-pre-wrap">{log}</pre></div>
        </div>
        <div className="pt-6 border-t border-slate-200 mt-auto">
            <button onClick={handleSend} disabled={!payload || sendingState === 'sending'} className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-0 bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                {sendingState === 'sending' ? <SpinnerIcon/> : <SendIcon/>}
                <span>{sendingState === 'sending' ? 'שולח...' : 'שלח סקר'}</span>
            </button>
        </div>
    </div>
  );
}
