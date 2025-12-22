
import React, { useState, useEffect } from 'react';

const GOOGLE_CLIENT_ID = "456093644604-43qt6d36nk36fassgbf1mm6otpav8mti.apps.googleusercontent.com"; 

declare const google: any;

interface AuthModalProps {
  onLogin: (username: string, syncKey: string, avatar?: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSyncKey = async (googleSubId: string) => {
    const salt = "chathub_v7_stable_key";
    const msgBuffer = new TextEncoder().encode(`${salt}_${googleSubId}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
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
              onLogin(userData.name || "משתמש", syncKey, userData.picture);
            } else {
              setError('שגיאה בזיהוי המשתמש.');
              setLoading(false);
            }
          },
        });
        const btnContainer = document.getElementById("googleBtn");
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, { theme: "outline", size: "large", width: 280, shape: "pill" });
        }
      } else {
        setTimeout(initGoogle, 500);
      }
    };
    initGoogle();
  }, [onLogin]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900">כניסה למערכת</h2>
          <p className="text-slate-500 mt-2 text-sm italic">מגבה את הנתונים שלך לענן v7...</p>
        </div>
        <div className="flex justify-center min-h-[60px]" dir="ltr">
          {loading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div> : <div id="googleBtn"></div>}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
