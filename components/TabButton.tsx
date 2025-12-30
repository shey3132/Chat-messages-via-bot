
import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 text-[11px] font-bold transition-all duration-300 rounded-lg whitespace-nowrap
      ${isActive
        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
        : 'text-slate-400 hover:text-slate-600'
      }`}
  >
    {children}
  </button>
);

export default TabButton;
