import React from 'react';

const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-bold transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg
      ${isActive
        ? 'bg-white text-indigo-700 shadow-md'
        : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
      }`}
  >
    {children}
  </button>
);

export default TabButton;
