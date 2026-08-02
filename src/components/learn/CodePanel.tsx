import React from 'react';
import { CODE_LINES } from '../../utils/algorithm';

interface CodePanelProps {
  activeLine: number;
  phase: 'idle' | 'running' | 'done';
}

export const CodePanel: React.FC<CodePanelProps> = ({ activeLine, phase }) => {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 font-mono text-sm">
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-gray-400 text-xs">is_balanced.py</span>
      </div>
      <div className="p-4 overflow-auto max-h-96">
        {CODE_LINES.map((line, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-2 py-0.5 rounded transition-colors duration-200 ${
              phase !== 'idle' && i === activeLine
                ? 'bg-teal-500/20 border-l-2 border-teal-400'
                : ''
            }`}
          >
            <span className="text-gray-600 select-none w-6 text-right flex-shrink-0 text-xs pt-0.5">
              {i + 1}
            </span>
            <span
              className={`whitespace-pre ${
                phase !== 'idle' && i === activeLine
                  ? 'text-teal-300'
                  : 'text-gray-300'
              }`}
            >
              {line || '\u00A0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
