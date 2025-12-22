
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
          callback: async (response: any) => {
            setLoading(true);
            const token = response.credential;
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            onLogin(payload.name, payload.sub, payload.picture);
          },
        });
        const btn = document.getElementById("googleBtn");
        if (btn) google.accounts.id.renderButton(btn, { theme: "filled_blue", size: "large", width: 340, shape: "pill", logo_alignment: "left" });
      } else setTimeout(initGoogle, 500);
    };
    initGoogle();
  }, [onLogin]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-slate-900/40 backdrop-blur-3xl w-full max-w-lg rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] p-12 lg:p-16 border border-white/10 text-center animate-in zoom-in-95 duration-700 relative overflow-hidden">
        
        {/* Glow behind logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-600/20 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] mx-auto mb-10 flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.4)] rotate-12 hover:rotate-0 transition-transform duration-500 cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            
            <h2 className="text-4xl font-outfit font-black text-white italic tracking-tighter mb-4">ChatHub</h2>
            <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] opacity-80 mb-10">Premium Messaging Platform</p>
            
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 mb-12 shadow-inner">
               <p className="text-sm text-slate-400 font-bold leading-relaxed italic">
                 "המערכת המקצועית והמעוצבת ביותר ליצירת הודעות וסקרים מעוצבים ל-Google Chat."
               </p>
            </div>

            <div className="flex justify-center min-h-[70px]" dir="ltr">
              {loading ? (
                 <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Authenticating...</span>
                 </div>
              ) : (
                <div className="hover:scale-105 transition-transform duration-500 shadow-2xl rounded-full">
                    <div id="googleBtn"></div>
                </div>
              )}
            </div>

            <div className="mt-16 flex flex-col gap-2">
                <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em]">Version 36.0 • Midnight Bloom Edition</p>
                <div className="flex justify-center gap-4 opacity-20">
                    <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                    <div className="h-1 w-8 bg-white/20 rounded-full" />
                    <div className="h-1 w-8 bg-white/20 rounded-full" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
