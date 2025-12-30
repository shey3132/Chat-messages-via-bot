
import React, { useState, useEffect } from 'react';

const GOOGLE_CLIENT_ID = "456093644604-43qt6d36nk36fassgbf1mm6otpav8mti.apps.googleusercontent.com"; 

declare const google: any;

interface AuthModalProps {
  onLogin: (username: string, syncKey: string, avatar?: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

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
            onLogin(payload.name, payload.sub, payload.picture);
          },
        });
        const btn = document.getElementById("googleBtn");
        if (btn) google.accounts.id.renderButton(btn, { theme: "outline", size: "large", width: 280, shape: "rectangular", logo_alignment: "left" });
      } else setTimeout(initGoogle, 300);
    };
    initGoogle();
  }, [onLogin]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-10 border border-slate-200 text-center animate-slide">
        
        <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2">ChatHub</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 italic">Professional Messaging Tool</p>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-10">
           <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
             "בנייה ושליחה של הודעות מעוצבות וסקרים לצוות ב-Google Chat בצורה קלה ומהירה."
           </p>
        </div>

        <div className="flex justify-center min-h-[50px]">
          {loading ? (
             <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest animate-pulse">מאמת חשבון Google...</span>
             </div>
          ) : (
            <div id="googleBtn" className="hover:opacity-90 transition-opacity"></div>
          )}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-50">
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">v46.0 • REFINED EDITION</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
