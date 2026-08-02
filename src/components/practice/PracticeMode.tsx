import React, { useState } from 'react';
import type { PracticeTab } from '../../types';
import { PushOrPop } from './PushOrPop';
import { CodeFillIn } from './CodeFillIn';
import { ReconstructSteps } from './ReconstructSteps';
import { FullTrace } from './FullTrace';

const TABS: { id: PracticeTab; label: string; icon: string; desc: string }[] = [
  {
    id: 'push-or-pop',
    label: 'Push or Pop?',
    icon: '🎯',
    desc: 'Drag characters to the right action',
  },
  {
    id: 'code-fill',
    label: 'Code Fill-In',
    icon: '✏️',
    desc: 'Complete the algorithm blanks',
  },
  {
    id: 'reconstruct',
    label: 'Reconstruct Steps',
    icon: '🔀',
    desc: 'Drag steps into the right order',
  },
  {
    id: 'trace',
    label: 'Full Trace',
    icon: '🧠',
    desc: 'Trace the full algorithm yourself',
  },
];

export const PracticeMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeTab>('push-or-pop');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
        {TABS.map(tab => (
          <button
            key={tab.id}
            data-testid={`practice-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] flex flex-col items-center gap-1 px-3 py-3 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              activeTab === tab.id
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="font-semibold text-xs">{tab.label}</span>
            <span className={`text-xs ${activeTab === tab.id ? 'text-teal-100' : 'text-gray-400'}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'push-or-pop' && <PushOrPop />}
      {activeTab === 'code-fill' && <CodeFillIn />}
      {activeTab === 'reconstruct' && <ReconstructSteps />}
      {activeTab === 'trace' && <FullTrace />}
    </div>
  );
};
