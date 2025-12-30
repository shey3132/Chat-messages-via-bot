
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
        ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100/50 border border-indigo-50'
        : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
      }`}
  >
    {children}
  </button>
);

export default TabButton;
