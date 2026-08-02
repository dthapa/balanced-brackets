import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Blank {
  id: string;
  label: string;
  answer: string;
  hint: string;
  context: string;
}

const BLANKS: Blank[] = [
  {
    id: 'openers',
    label: '1',
    answer: '([{',
    hint: 'The three opening bracket characters',
    context: 'if ch in ____:',
  },
  {
    id: 'append',
    label: '2',
    answer: 'append',
    hint: 'The list method that adds to the end',
    context: 'stack.____(ch)',
  },
  {
    id: 'matching',
    label: '3',
    answer: 'matching',
    hint: 'The dictionary variable defined at the top',
    context: 'stack[-1] != ____[ch]',
  },
  {
    id: 'pop',
    label: '4',
    answer: 'pop',
    hint: 'The list method that removes the last element',
    context: 'stack.____( )',
  },
  {
    id: 'zero',
    label: '5',
    answer: '0',
    hint: 'An empty stack has how many items?',
    context: 'return len(stack) == ____',
  },
];

interface BlankState {
  value: string;
  status: 'idle' | 'correct' | 'wrong';
}

export const CodeFillIn: React.FC = () => {
  const [blanks, setBlanks] = useState<Record<string, BlankState>>(
    () =>
      Object.fromEntries(
        BLANKS.map(b => [b.id, { value: '', status: 'idle' as const }])
      )
  );
  const [checked, setChecked] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const handleChange = (id: string, value: string) => {
    if (blanks[id].status === 'correct') return;
    setBlanks(prev => ({ ...prev, [id]: { value, status: 'idle' } }));
  };

  const handleCheck = () => {
    const newBlanks = { ...blanks };
    let correct = 0;
    BLANKS.forEach(b => {
      if (newBlanks[b.id].status === 'correct') {
        correct++;
        return;
      }
      const isCorrect = newBlanks[b.id].value.trim() === b.answer;
      newBlanks[b.id] = {
        ...newBlanks[b.id],
        status: isCorrect ? 'correct' : 'wrong',
      };
      if (isCorrect) correct++;
    });
    setBlanks(newBlanks);
    setChecked(true);

    // Shake wrong ones
    const wrongIds = BLANKS.filter(b => newBlanks[b.id].status === 'wrong').map(b => b.id);
    if (wrongIds.length > 0) {
      setShakeId(wrongIds[0]);
      setTimeout(() => setShakeId(null), 500);
    }

    if (correct === BLANKS.length) {
      setAllCorrect(true);
    }
  };

  const handleReset = () => {
    setBlanks(
      Object.fromEntries(
        BLANKS.map(b => [b.id, { value: '', status: 'idle' as const }])
      )
    );
    setChecked(false);
    setAllCorrect(false);
    setShakeId(null);
  };

  const codeLines = [
    { text: "def is_balanced(s):", blank: null },
    { text: "    stack = []", blank: null },
    { text: "    matching = {')':" + " '(', ']': '[', '}': '{'}", blank: null },
    { text: "", blank: null },
    { text: "    for ch in s:", blank: null },
    { text: "        if ch in ", blank: 'openers', suffix: ":" },
    { text: "            stack.", blank: 'append', suffix: "(ch)" },
    { text: "        elif ch in ')]}': ", blank: null },
    { text: "            if not stack or stack[-1] != ", blank: 'matching', suffix: "[ch]:" },
    { text: "                return False", blank: null },
    { text: "            stack.", blank: 'pop', suffix: "()" },
    { text: "", blank: null },
    { text: "    return len(stack) == ", blank: 'zero' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Code Fill-In</h2>
        <p className="text-sm text-gray-500 mb-5">
          Fill in the blanks to complete the balanced brackets algorithm.
        </p>

        <div className="bg-gray-900 rounded-xl overflow-hidden font-mono text-sm">
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-gray-400 text-xs">is_balanced.py</span>
          </div>
          <div className="p-4 space-y-1">
            {codeLines.map((line, i) => (
              <div key={i} className="flex items-center gap-1 flex-wrap">
                <span className="text-gray-600 w-6 text-right text-xs select-none">{i + 1}</span>
                <span className="text-gray-300 whitespace-pre">{line.text}</span>
                {line.blank && (
                  <InlineBlank
                    blankId={line.blank}
                    state={blanks[line.blank]}
                    answer={BLANKS.find(b => b.id === line.blank)!.answer}
                    onChange={val => handleChange(line.blank!, val)}
                    shake={shakeId === line.blank}
                  />
                )}
                {line.suffix && (
                  <span className="text-gray-300 whitespace-pre">{line.suffix}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hints */}
      {checked && !allCorrect && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-amber-800">Hints:</p>
          {BLANKS.filter(b => blanks[b.id].status === 'wrong').map(b => (
            <p key={b.id} className="text-sm text-amber-700">
              <span className="font-mono font-bold">#{b.label}</span> — {b.hint}
            </p>
          ))}
        </div>
      )}

      <AnimatePresence>
        {allCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center"
          >
            <p className="text-2xl font-bold text-green-700">🎉 All correct!</p>
            <p className="text-green-600 mt-1">You nailed the algorithm!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 justify-center">
        <button
          onClick={handleCheck}
          disabled={allCorrect}
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Check Answers
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 border-2 border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

interface InlineBlankProps {
  blankId: string;
  state: BlankState;
  answer: string;
  onChange: (val: string) => void;
  shake: boolean;
}

const InlineBlank: React.FC<InlineBlankProps> = ({ blankId, state, answer, onChange, shake }) => {
  const width = Math.max(answer.length * 9 + 16, 60);

  return (
    <motion.input
      key={blankId}
      animate={shake ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
      transition={shake ? { duration: 0.4 } : {}}
      type="text"
      value={state.value}
      onChange={e => onChange(e.target.value)}
      disabled={state.status === 'correct'}
      placeholder="____"
      style={{ width }}
      className={`inline-block px-1.5 py-0.5 rounded-md border-2 text-center font-mono text-sm transition-all focus:outline-none ${
        state.status === 'correct'
          ? 'bg-green-900/40 border-green-500 text-green-300 cursor-default'
          : state.status === 'wrong'
          ? 'bg-red-900/40 border-red-500 text-red-300'
          : 'bg-gray-700 border-gray-500 text-yellow-300 focus:border-yellow-400'
      }`}
    />
  );
};
