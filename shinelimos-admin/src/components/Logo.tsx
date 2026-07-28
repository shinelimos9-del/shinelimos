import React from 'react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">
        SL
      </div>
      <div>
        <span className="font-bold text-white tracking-wide text-sm block">ShineLimos</span>
        <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase block">Admin Portal</span>
      </div>
    </div>
  );
}
