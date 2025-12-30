
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
        if (btn) google.accounts.id.renderButton(btn, { theme: "filled_blue", size: "large", width: 320, shape: "circle" });
      } else setTimeout(initGoogle, 300);
    };
    initGoogle();
  }, [onLogin]);

  const handleGuestEnter = () => {
    const name = guestName.trim() || `אורח_${Math.floor(Math.random() * 1000)}`;
    onLogin(name, `guest-${Date.now()}`, undefined, true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-12 border border-slate-100 text-center animate-ready">
        
        <div className="w-16 h-16 header-gradient rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none stroke-white" strokeWidth="10" strokeLinecap="round">
                <rect x="5" y="5" width="90" height="90" rx="20" opacity="0.3"/>
                <path d="M25 35h50M25 50h50M25 65h30"/>
            </svg>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter uppercase">ChatHub</h2>
        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-10">Premium Workspace Tool</p>
        
        <div className="flex justify-center mb-6">
          {loading ? (
             <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">מתחבר...</span>
             </div>
          ) : (
            <div id="googleBtn" className="hover:scale-105 transition-transform"></div>
          )}
        </div>

        <div className="relative flex items-center gap-4 my-8 opacity-30">
            <div className="h-px bg-slate-400 flex-1"></div>
            <span className="text-xs font-black text-slate-600">או</span>
            <div className="h-px bg-slate-400 flex-1"></div>
        </div>

        {showGuestInput ? (
          <div className="space-y-4 animate-ready">
            <input 
              type="text" 
              value={guestName} 
              onChange={(e) => setGuestName(e.target.value)} 
              placeholder="איך תרצה שנקרא לך?"
              className="w-full text-sm rounded-2xl border-2 border-slate-100 bg-slate-50 h-14 px-6 focus:border-indigo-400 text-center font-bold outline-none transition-all"
              autoFocus
            />
            <button 
              onClick={handleGuestEnter}
              className="w-full bg-slate-900 text-white text-xs font-black h-14 rounded-2xl hover:bg-black uppercase tracking-widest transition-all shadow-lg"
            >
              המשך כאורח
            </button>
            <button onClick={() => setShowGuestInput(false)} className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold underline">חזור להתחברות</button>
          </div>
        ) : (
          <button 
            onClick={() => setShowGuestInput(true)}
            className="w-full bg-indigo-50 text-indigo-600 text-xs font-black h-14 rounded-2xl hover:bg-indigo-100 uppercase tracking-widest transition-all border border-indigo-100"
          >
            כניסה ללא חשבון (Guest)
          </button>
        )}

        <div className="mt-12 pt-8 border-t border-slate-50">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">v53.0 • UNICODE FIXED</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
