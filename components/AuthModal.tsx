
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

  // פונקציית גיבוב ליצירת מפתח סנכרון (אותה זהות גוגל = אותו מפתח ענן)
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
              // שימוש ב-sub (המזהה הקבוע של גוגל למשתמש) ליצירת מפתח ענן אישי
              const syncKey = await generateSyncKey(userData.sub);
              onLogin(userData.given_name || userData.name, syncKey, userData.picture);
            } else {
              setError('לא הצלחנו לאמת את חשבון הגוגל שלך.');
              setLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        const btnContainer = document.getElementById("googleBtn");
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: 280, // שימוש ברוחב קבוע למניעת שבירה
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left"
          });
        }
      } else {
        // ניסיון חוזר אם הספרייה טרם נטענה (בגלל async script)
        setTimeout(initGoogle, 500);
      }
    };

    initGoogle();
  }, [onLogin]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 sm:p-12 animate-in fade-in zoom-in duration-500 border border-white/20">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-200">
            <img 
              src="https://raw.githubusercontent.com/shey3132/-22/main/%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%20%D7%93%D7%99%D7%92%D7%99%D7%98%D7%9C%D7%99%20%D7%A2%D7%9D%20%D7%A8%D7%A9%D7%AA%20%D7%A4%D7%A2%D7%95%D7%9C%D7%94.png" 
              alt="ChatHub" 
              className="w-14 h-14 brightness-0 invert" 
            />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">התחברות מהירה</h2>
          <p className="text-slate-500 mt-2 font-medium">ההיסטוריה שלך תסתנכרן אוטומטית</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 text-center animate-shake">
            {error}
          </div>
        )}

        {/* מיכל הלחצן - הוספתי dir="ltr" ורוחב מוגדר כדי להבטיח מירכוז מושלם */}
        <div className="flex flex-col items-center justify-center min-h-[80px]" dir="ltr">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs font-black text-indigo-600 uppercase tracking-widest" dir="rtl">מתחבר ומסנכרן...</p>
            </div>
          ) : (
            <div id="googleBtn" className="flex justify-center w-full max-w-[280px] transform hover:scale-[1.02] transition-transform"></div>
          )}
        </div>

        <div className="mt-14 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="h-px w-8 bg-slate-100"></span>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">מאובטח ע"י גוגל</p>
              <span className="h-px w-8 bg-slate-100"></span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
