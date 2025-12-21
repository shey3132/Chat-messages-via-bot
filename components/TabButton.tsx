
import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2.5 text-sm font-bold transition-all duration-200 focus:outline-none rounded-xl
      ${isActive
        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
        : 'text-slate-500 hover:text-slate-800'
      }`}
  >
    {children}
  </button>
);

export default TabButton;
