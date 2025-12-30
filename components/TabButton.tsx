
import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 text-[10px] font-black transition-all duration-300 rounded-xl whitespace-nowrap uppercase tracking-widest
      ${isActive
        ? 'bg-white text-indigo-700 shadow-xl'
        : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
  >
    {children}
  </button>
);

export default TabButton;
