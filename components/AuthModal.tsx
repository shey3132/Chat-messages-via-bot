
import React, { useState, useEffect } from 'react';

// --- הגדרות חשובות ---
const GOOGLE_CLIENT_ID = "456093644604-43qt6d36nk36fassgbf1mm6otpav8mti.apps.googleusercontent.com"; 

declare const google: any;

interface AuthModalProps {
  onLogin: (username: string, syncKey: string, avatar?: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // פונקציית גיבוב יציבה ליצירת מפתח סנכרון ייחודי לכל משתמש גוגל
  const generateSyncKey = async (googleSubId: string) => {
    // השתמש במחרוזת קבועה כדי שהמפתח יהיה זהה תמיד לאותו משתמש
    const salt = "chathub_production_v1";
    const msgBuffer = new TextEncoder().encode(`${salt}_${googleSubId}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // מפתח קצר ויציב ל-KV
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 24);
  };

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
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
            if (userData && userData.sub) {
              const syncKey = await generateSyncKey(userData.sub);
              console.log("Generated Sync Key for user:", syncKey);
              onLogin(userData.name || "משתמש", syncKey, userData.picture);
            } else {
              setError('שגיאה בזיהוי המשתמש.');
              setLoading(false);
            }
          },
          auto_select: false,
        });

        const btnContainer = document.getElementById("googleBtn");
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: 280,
            text: "continue_with",
            shape: "pill",
          });
        }
      } else {
        setTimeout(initGoogle, 500);
      }
    };
    initGoogle();
  }, [onLogin]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 sm:p-12 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900">ברוכים הבאים</h2>
          <p className="text-slate-500 mt-2 text-sm">התחברו כדי לשמור את הוובוקים וההיסטוריה שלכם בענן בצורה מאובטחת.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">{error}</div>}

        <div className="flex flex-col items-center justify-center min-h-[100px]" dir="ltr">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-indigo-600 uppercase" dir="rtl">טוען נתונים מהענן...</p>
            </div>
          ) : (
            <div id="googleBtn" className="w-full flex justify-center"></div>
          )}
        </div>
        
        <p className="mt-10 text-[10px] text-slate-400 text-center leading-relaxed">
          המידע שלכם נשמר במוצפן בשרתי KVDB.<br/>אנו לא שומרים את פרטי הכניסה שלכם.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
