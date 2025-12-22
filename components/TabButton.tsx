
import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2.5 text-xs font-black transition-all duration-500 focus:outline-none rounded-xl flex items-center gap-3 uppercase tracking-widest
      ${isActive
        ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
      }`}
  >
    {children}
  </button>
);

export default TabButton;
