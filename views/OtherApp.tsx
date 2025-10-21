import React, { useState, useCallback, useRef, useEffect, ChangeEvent, useMemo } from 'react';
import { ChatMessagePayload, CardV2 } from '../types';
import { emojiNames, emojiCategories } from '../data/emojis';

// --- Icon Components ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ClipboardIcon = ({ copied }: { copied: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {copied ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      )}
    </svg>
);

const FaceSmileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const commonInputClasses = "block w-full mt-1 rounded-lg border-slate-300 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm";
const labelClasses = "block text-sm font-medium text-slate-600";


interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
    const pickerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
    
    const filteredEmojis = useMemo(() => {
      if (!searchQuery.trim()) return null;
      const query = searchQuery.trim().toLowerCase();
      // Search in Hebrew names
      return Object.entries(emojiNames)
        .filter(([_, name]) => name.toLowerCase().includes(query))
        .map(([emoji]) => emoji);
    }, [searchQuery]);

    const renderEmojiButtons = (emojis: string[]) => (
         <div className="flex flex-row flex-wrap justify-start gap-1">
            {emojis.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    title={emojiNames[emoji] || ''}
                    className="w-9 h-9 text-2xl rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );

    return (
        <div ref={pickerRef} className="absolute z-20 w-80 max-h-96 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 mt-2">
            <div className="p-2 border-b border-slate-200">
                <input
                    type="text"
                    placeholder="חיפוש אימוג'י..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                    autoFocus
                />
            </div>
            <div className="overflow-y-auto p-2">
                {filteredEmojis ? (
                    filteredEmojis.length > 0 ? (
                        renderEmojiButtons(filteredEmojis)
                    ) : (
                        <p className="w-full text-center text-sm text-slate-500 py-4">לא נמצאו תוצאות</p>
                    )
                ) : (
                    emojiCategories.map(category => (
                        <div key={category.name} className="mb-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase sticky top-0 bg-white/80 backdrop-blur-sm py-1">{category.name}</h4>
                            <div className="mt-1">
                                {renderEmojiButtons(category.emojis)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

interface OtherAppProps {
    saveHistory: (payload: ChatMessagePayload) => void;
}

interface PollOption {
  id: number;
  emoji: string;
  text: string;
}

export default function OtherApp({ saveHistory }: OtherAppProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [question, setQuestion] = useState('מה דעתכם בנושא?');
  const [options, setOptions] = useState<PollOption[]>([
    { id: 1, emoji: '👍', text: 'בעד' },
    { id: 2, emoji: '👎', text: 'נגד' },
  ]);
  const [nextId, setNextId] = useState(3);
  const [log, setLog] = useState('מוכן.');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [pickerOpenFor, setPickerOpenFor] = useState<number | null>(null);
  const [isQuestionPickerOpen, setQuestionPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);


  const payload = useMemo<ChatMessagePayload | null>(() => {
    const validOptions = options.filter(opt => opt.text.trim());
    if (!question.trim() || validOptions.length === 0) {
      return null;
    }

    const cardV2: CardV2 = {
      cardId: `poll-${Date.now()}`,
      card: {
        header: {
          title: question.trim(),
        },
        sections: [{
          widgets: validOptions.map(opt => ({
            decoratedText: {
              text: `${opt.emoji} ${opt.text.trim()}`,
            },
          })),
        }],
      },
    };
    return { cardsV2: [cardV2] };
  }, [question, options]);


  const handleOptionChange = (id: number, field: 'text' | 'emoji', value: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  };
  
  const handleAddOption = () => {
    setOptions([...options, { id: nextId, emoji: '🤔', text: '' }]);
    setNextId(nextId + 1);
  };
  
  const handleRemoveOption = (id: number) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleSend = async () => {
    if (!webhookUrl.trim()) {
      setLog('שגיאה: חובה להזין Webhook URL!');
      setSendingState('error');
      return;
    }
    if (!payload) {
      setLog('שגיאה: יש לוודא שהשאלה ולפחות אפשרות אחת אינם ריקים.');
      setSendingState('error');
      return;
    }

    setSendingState('sending');
    setLog('שולח סקר...');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const responseBody = await response.text();

      if (!response.ok) {
        setLog(`שגיאה בשליחה: HTTP ${response.status}\n\nתגובה:\n${responseBody}`);
        setSendingState('error');
      } else {
        setLog(`הסקר נשלח בהצלחה! HTTP ${response.status}`);
        setSendingState('success');
        saveHistory(payload);
        setTimeout(() => setSendingState('idle'), 2000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLog(`שגיאת רשת: ${message}`);
      setSendingState('error');
      console.error("Webhook send error:", error);
    }
  };

  const copyPayload = () => {
    if(!payload) return;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col bg-white/70 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 h-full">
        <header className="flex items-center gap-3 mb-6">
            <div className="bg-teal-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">מחולל סקרים</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 pl-4 space-y-6">
            <div>
                <label htmlFor="webhookPoll" className={labelClasses}>Webhook URL</label>
                <input id="webhookPoll" type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://chat.googleapis.com/v1/spaces/..." className={commonInputClasses} />
            </div>

            <div className="space-y-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
                <div>
                    <label htmlFor="question" className={labelClasses}>שאלת הסקר</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            id="question"
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="מה השאלה?"
                            className={`${commonInputClasses} mt-0 flex-grow`}
                        />
                        <div className="relative">
                             <button
                                onClick={() => setQuestionPickerOpen(prev => !prev)}
                                className="w-10 h-10 bg-white border border-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-100 transition"
                                aria-label="בחר אימוג'י לשאלה"
                             >
                                <FaceSmileIcon />
                             </button>
                             {isQuestionPickerOpen && (
                                <EmojiPicker
                                    onSelect={emoji => {
                                        setQuestion(prev => prev + emoji);
                                        setQuestionPickerOpen(false);
                                    }}
                                    onClose={() => setQuestionPickerOpen(false)}
                                />
                             )}
                        </div>
                    </div>
                </div>
                
                <div>
                    <label className={labelClasses}>אפשרויות</label>
                    <div className="space-y-2 mt-2">
                        {options.map((option, index) => (
                            <div key={option.id} className="flex items-center gap-2">
                                <div className="relative">
                                    <button onClick={() => setPickerOpenFor(pickerOpenFor === option.id ? null : option.id)} className="w-10 h-10 text-2xl bg-white border border-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-100 transition">
                                        {option.emoji}
                                    </button>
                                    {pickerOpenFor === option.id && (
                                        <EmojiPicker 
                                            onSelect={emoji => {
                                                handleOptionChange(option.id, 'emoji', emoji);
                                                setPickerOpenFor(null);
                                            }}
                                            onClose={() => setPickerOpenFor(null)}
                                        />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                                    placeholder={`אפשרות ${index + 1}`}
                                    className={`${commonInputClasses} mt-0`}
                                />
                                <button
                                    onClick={() => handleRemoveOption(option.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                    aria-label="Remove option"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleAddOption}
                        className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                        + הוסף אפשרות
                    </button>
                </div>
            </div>
          
            <div className="pt-4">
                <div className="flex justify-between items-center">
                    <label className={labelClasses}>תצוגה מקדימה חיה</label>
                    <button onClick={copyPayload} disabled={!payload} className="text-xs font-semibold text-slate-500 hover:text-indigo-600 disabled:opacity-50 flex items-center gap-1">
                      <ClipboardIcon copied={copied} /> {copied ? 'הועתק!' : 'העתק JSON'}
                    </button>
                </div>
                <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-4 min-h-[200px] bg-slate-100/50">
                    {payload ? (
                      <div className="preview-card border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm w-full text-sm">
                          <div className="card-header p-2">
                              <strong className="font-semibold block text-slate-900">{payload.cardsV2![0].card.header?.title}</strong>
                              {payload.cardsV2![0].card.header?.subtitle && <span className="text-xs text-slate-500 block">{payload.cardsV2![0].card.header?.subtitle}</span>}
                          </div>
                          <div className="section border-t border-slate-200 p-2 flex flex-col gap-1">
                              {payload.cardsV2![0].card.sections[0].widgets.map((widget, widIndex) => (
                                  <div key={widIndex} className="rounded-md bg-slate-200/50 p-2 text-slate-800 text-sm">
                                      {widget.decoratedText.text}
                                  </div>
                              ))}
                          </div>
                      </div>
                    ) : (
                      <div className="grid place-content-center h-full text-slate-500">התצוגה תופיע כאן</div>
                    )}
                </div>
            </div>

            <div>
                <label className={labelClasses}>לוג</label>
                <pre className="mt-2 p-4 bg-slate-800 text-slate-200 text-sm rounded-lg h-24 overflow-auto whitespace-pre-wrap font-mono">{log}</pre>
            </div>
        </div>

        <div className="pt-6 border-t border-slate-200 mt-auto">
            <button 
                onClick={handleSend}
                disabled={!payload || sendingState === 'sending'}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-0 bg-indigo-600 text-white font-bold text-lg cursor-pointer shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-slate-500"
            >
                {sendingState === 'sending' ? <SpinnerIcon/> : <SendIcon/>}
                <span>{sendingState === 'sending' ? 'שולח...' : 'שלח סקר'}</span>
            </button>
        </div>
    </div>
  );
}