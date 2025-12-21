
import React, { useState, useEffect } from 'react';

// --- הגדרות חשובות ---
// המזהה האישי שלך שהונפק ב-Google Cloud Console
const GOOGLE_CLIENT_ID = "456093644604-43qt6d36nk36fassgbf1mm6otpav8mti.apps.googleusercontent.com"; 

declare const google: any;

interface AuthModalProps {
  onLogin: (username: string, syncKey: string, avatar?: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'selection' | 'manual'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // פונקציית גיבוב ליצירת מפתח סנכרון (אותה זהות = אותו מפתח)
  const generateSyncKey = async (identity: string) => {
    const msgBuffer = new TextEncoder().encode(`chathub_v5_${identity.toLowerCase()}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  };

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            setLoading(true);
            const userData = decodeJWT(response.credential);
            if (userData) {
              // שימוש ב-sub (המזהה הקבוע של גוגל למשתמש) ליצירת מפתח ענן
              const syncKey = await generateSyncKey(userData.sub);
              onLogin(userData.given_name || userData.name, syncKey, userData.picture);
            } else {
              setError('לא הצלחנו לאמת את חשבון הגוגל שלך.');
            }
            setLoading(false);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnContainer = document.getElementById("googleBtn");
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: btnContainer.offsetWidth || 320,
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left"
          });
        }
      } else {
        // ניסיון חוזר אם הספרייה טרם נטענה
        setTimeout(initGoogle, 500);
      }
    };

    if (authMode === 'selection') {
      initGoogle();
    }
  }, [onLogin, authMode]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('נא להזין פרטי התחברות תקינים');
      return;
    }
    setLoading(true);
    const syncKey = await generateSyncKey(email + password);
    setTimeout(() => {
      onLogin(email.split('@')[0], syncKey);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 sm:p-12 animate-in fade-in zoom-in duration-500 border border-white/20">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-200">
            <img src="https://raw.githubusercontent.com/shey3132/-22/main/%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%20%D7%93%D7%99%D7%92%D7%99%D7%98%D7%9C%D7%99%20%D7%A2%D7%9D%20%D7%A8%D7%A9%D7%AA%20%D7%A4%D7%A2%D7%95%D7%9C%D7%94.png" alt="ChatHub" className="w-14 h-14 brightness-0 invert" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ברוכים הבאים</h2>
          <p className="text-slate-500 mt-2 font-medium">ההיסטוריה שלך מסתנכרנת בבטחה</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {authMode === 'selection' ? (
          <div className="space-y-8">
            <div className="flex flex-col items-center">
              <div id="googleBtn" className="w-full h-[50px]"></div>
            </div>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">או</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button 
              onClick={() => setAuthMode('manual')}
              className="w-full py-4 bg-slate-50 text-slate-600 rounded-full font-bold text-sm hover:bg-slate-100 transition-all border border-slate-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              המשך עם אימייל וסיסמה
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="אימייל"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
            />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'מתחבר...' : 'התחברות'}
            </button>
            <button 
              type="button"
              onClick={() => setAuthMode('selection')}
              className="w-full text-slate-400 text-xs font-bold hover:text-indigo-500 transition-colors pt-2"
            >
              חזור לאפשרויות כניסה
            </button>
          </form>
        )}

        <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] leading-relaxed">
              סנכרון ענן מאובטח • ChatHub v5.0
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
