import React from 'react';
import { IconSparkles } from './Icons';
import { ToneOption } from '../types';

interface HeaderProps {
  currentTone: ToneOption;
  onToneChange: (tone: ToneOption) => void;
}

const Header: React.FC<HeaderProps> = ({ currentTone, onToneChange }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <IconSparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">ProsePolish</h1>
          <p className="text-xs text-slate-500 font-medium">Context-Aware Grammar Editor</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 hidden sm:inline-block">Tone:</span>
        <div className="relative">
          <select
            value={currentTone}
            onChange={(e) => onToneChange(e.target.value as ToneOption)}
            className="appearance-none bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium hover:bg-slate-50 transition-colors"
          >
            {Object.values(ToneOption).map((tone) => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
