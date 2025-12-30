
import React, { useState, useEffect } from 'react';

const GOOGLE_CLIENT_ID = "456093644604-43qt6d36nk36fassgbf1mm6otpav8mti.apps.googleusercontent.com"; 

declare const google: any;

interface AuthModalProps {
  onLogin: (username: string, syncKey: string, avatar?: string, isGuest?: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [showGuestInput, setShowGuestInput] = useState(false);

  useEffect(() => {
    const initGoogle = () => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          callback: async (response: any) => {
            setLoading(true);
            const token = response.credential;
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            onLogin(payload.name, payload.sub, payload.picture, false);
          },
        });
        const btn = document.getElementById("googleBtn");
        if (btn) google.accounts.id.renderButton(btn, { theme: "outline", size: "large", width: 320, shape: "pill" });
      } else setTimeout(initGoogle, 300);
    };
    initGoogle();
  }, [onLogin]);

  const handleGuestEnter = () => {
    const name = guestName.trim() || `Guest_${Math.floor(Math.random() * 1000)}`;
    onLogin(name, `guest-${Date.now()}`, undefined, true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 border border-indigo-50 text-center animate-fade">
        
        <div className="w-11 h-11 bg-indigo-600 rounded-xl mx-auto mb-5 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        
        <h2 className="text-xl font-black text-slate-800 mb-1">ChatHub</h2>
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6">Messaging for Professionals</p>
        
        <div className="flex justify-center min-h-[50px] mb-4">
          {loading ? (
             <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">מתחבר...</span>
             </div>
          ) : (
            <div id="googleBtn" className="hover:opacity-90 transition-opacity"></div>
          )}
        </div>

        <div className="relative flex items-center gap-3 my-6 opacity-40">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400">או</span>
            <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {showGuestInput ? (
          <div className="space-y-3 animate-fade">
            <input 
              type="text" 
              value={guestName} 
              onChange={(e) => setGuestName(e.target.value)} 
              placeholder="איך תרצה שנקרא לך?"
              className="w-full text-xs rounded-full border-slate-200 bg-slate-50 h-10 px-4 focus:border-indigo-400 text-center font-bold"
              autoFocus
            />
            <button 
              onClick={handleGuestEnter}
              className="w-full bg-slate-900 text-white text-[10px] font-bold h-10 rounded-full hover:bg-slate-800 uppercase tracking-widest transition-all"
            >
              המשך כאורח
            </button>
            <button 
              onClick={() => setShowGuestInput(false)}
              className="text-[9px] text-slate-400 hover:text-indigo-500 font-bold"
            >
              חזור להתחברות
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowGuestInput(true)}
            className="w-full border border-slate-200 text-slate-500 text-[10px] font-bold h-10 rounded-full hover:bg-slate-50 uppercase tracking-widest transition-all"
          >
            כניסה כאורח
          </button>
        )}

        <div className="mt-8 pt-6 border-t border-slate-50 text-[9px] text-slate-300 font-bold uppercase tracking-widest">
            v47.0 • Purple Refined
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
