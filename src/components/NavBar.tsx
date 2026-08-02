import React from 'react';
import type { AppMode } from '../types';

interface NavBarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ mode, onModeChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧱</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Balanced Brackets</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Learn the stack algorithm</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            data-testid="nav-learn"
            onClick={() => onModeChange('learn')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              mode === 'learn'
                ? 'bg-white text-teal-700 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📚 Learn
          </button>
          <button
            data-testid="nav-practice"
            onClick={() => onModeChange('practice')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              mode === 'practice'
                ? 'bg-white text-teal-700 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎮 Practice
          </button>
        </nav>
      </div>
    </header>
  );
};
