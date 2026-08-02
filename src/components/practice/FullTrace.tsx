import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeSteps, PRESET_STRINGS } from '../../utils/algorithm';
import type { AlgorithmStep } from '../../types';
import { StackVisual } from '../learn/StackVisual';

interface TraceState {
  stepIndex: number;
  steps: AlgorithmStep[];
  stack: string[];
  score: { correct: number; total: number };
  done: boolean;
  terminated: boolean;
  feedback: { correct: boolean; message: string } | null;
  shaking: boolean;
}

function initState(input: string): TraceState {
  const result = computeSteps(input);
  const steps = result.steps.filter(s => s.action.type !== 'skip');
  return {
    stepIndex: 0,
    steps,
    stack: [],
    score: { correct: 0, total: 0 },
    done: false,
    terminated: false,
    feedback: null,
    shaking: false,
  };
}

export const FullTrace: React.FC = () => {
  const [presetIndex, setPresetIndex] = useState(0);
  const [state, setState] = useState<TraceState>(() => initState(PRESET_STRINGS[0].value));

  const currentStep = state.steps[state.stepIndex];
  const correctAction = currentStep?.action.type;

  const handleAction = useCallback((action: 'push' | 'pop' | 'unbalanced') => {
    if (state.done || state.terminated || !currentStep) return;

    const isCorrect =
      (action === 'push' && correctAction === 'push') ||
      (action === 'pop' && correctAction === 'pop') ||
      (action === 'unbalanced' && correctAction === 'mismatch');

    setState(prev => {
      const newTotal = prev.score.total + 1;
      const newCorrect = prev.score.correct + (isCorrect ? 1 : 0);

      if (!isCorrect) {
        const hints: Record<string, string> = {
          push: `"${currentStep.char}" is an opener — the right move was Push.`,
          pop: `"${currentStep.char}" matches the top — the right move was Pop.`,
          unbalanced: `This was actually a mismatch — the right move was Unbalanced.`,
        };
        return {
          ...prev,
          score: { correct: newCorrect, total: newTotal },
          feedback: { correct: false, message: hints[correctAction ?? 'push'] },
          shaking: true,
        };
      }

      // Apply the correct action
      let newStack = [...prev.stack];
      let terminated = false;
      let done = false;

      if (correctAction === 'push') {
        newStack.push(currentStep.char);
      } else if (correctAction === 'pop') {
        newStack.pop();
      } else if (correctAction === 'mismatch') {
        terminated = true;
      }

      const nextIndex = prev.stepIndex + 1;
      if (nextIndex >= prev.steps.length || terminated) {
        done = true;
        if (!terminated && newStack.length > 0) {
          // unclosed brackets remain → also done/unbalanced
        }
      }

      return {
        ...prev,
        stepIndex: nextIndex,
        stack: newStack,
        score: { correct: newCorrect, total: newTotal },
        done,
        terminated,
        feedback: {
          correct: true,
          message:
            correctAction === 'push'
              ? `Correct! Pushed "${currentStep.char}" onto the stack.`
              : correctAction === 'pop'
              ? `Correct! Popped "${prev.stack[prev.stack.length - 1]}" — matched!`
              : `Correct! Detected mismatch — string is unbalanced.`,
        },
        shaking: false,
      };
    });

    setTimeout(() => {
      setState(prev => ({ ...prev, feedback: null, shaking: false }));
    }, 1000);
  }, [state, currentStep, correctAction]);

  const loadPreset = (idx: number) => {
    setPresetIndex(idx);
    setState(initState(PRESET_STRINGS[idx].value));
  };

  const isBalanced = !state.terminated && state.stack.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex flex-wrap gap-2 justify-center">
        {PRESET_STRINGS.map((p, i) => (
          <button
            key={i}
            onClick={() => loadPreset(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold border-2 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              i === presetIndex
                ? 'bg-teal-500 border-teal-500 text-white'
                : 'border-gray-300 text-gray-600 hover:border-teal-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Full Trace Challenge</h2>
          <span className="text-sm font-semibold text-teal-600">
            {state.score.correct}/{state.score.total} correct
          </span>
        </div>

        {/* Input tiles */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Input String</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_STRINGS[presetIndex].value.split('').map((ch, i) => {
              const processedSteps = state.steps.slice(0, state.stepIndex);
              const charIndices = processedSteps.map(s => s.charIndex);
              const isProcessed = charIndices.includes(i);
              const isCurrent = state.steps[state.stepIndex]?.charIndex === i;
              const isOpener = '([{'.includes(ch);
              const isCloser = ')]}'.includes(ch);

              return (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-base font-bold font-mono transition-all select-none ${
                    isCurrent
                      ? 'bg-amber-400 border-amber-300 text-gray-800 scale-110 shadow-md'
                      : isProcessed
                      ? 'bg-gray-200 border-gray-300 text-gray-400 opacity-60'
                      : isOpener
                      ? 'bg-teal-100 border-teal-300 text-teal-800'
                      : isCloser
                      ? 'bg-orange-100 border-orange-300 text-orange-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                >
                  {ch}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <StackVisual stack={state.stack} />

          <div className="flex-1 space-y-3">
            {!state.done ? (
              <>
                {currentStep && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Current character:</p>
                    <motion.div
                      animate={state.shaking ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
                      transition={state.shaking ? { duration: 0.4 } : {}}
                      className={`w-14 h-14 mx-auto rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-mono mb-3 ${'([{'.includes(currentStep.char) ? 'bg-teal-500 border-teal-400 text-white' : 'bg-orange-500 border-orange-400 text-white'}`}
                    >
                      {currentStep.char}
                    </motion.div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAction('push')}
                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    ⬇ Push
                  </button>
                  <button
                    onClick={() => handleAction('pop')}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    ⬆ Pop
                  </button>
                  <button
                    onClick={() => handleAction('unbalanced')}
                    className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    ✗ Unbalanced — Stop
                  </button>
                </div>
              </>
            ) : (
              <div className={`rounded-xl p-4 text-center border-2 ${isBalanced ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                <p className={`text-xl font-bold ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                  {isBalanced ? '✓ Balanced!' : '✗ Unbalanced'}
                </p>
                <p className="text-sm mt-1 text-gray-600">
                  Score: <span className="font-bold text-teal-600">{state.score.correct}/{state.score.total}</span>
                </p>
                <button
                  onClick={() => setState(initState(PRESET_STRINGS[presetIndex].value))}
                  className="mt-3 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  ↺ Replay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {state.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl px-5 py-3 text-center font-semibold border-2 ${
              state.feedback.correct
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-red-50 border-red-400 text-red-800'
            }`}
          >
            {state.feedback.correct ? '✓ ' : '✗ '}{state.feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
