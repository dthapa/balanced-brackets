import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeSteps, PRESET_STRINGS } from '../../utils/algorithm';
import type { AlgorithmStep } from '../../types';
import { StackVisual } from './StackVisual';
import { CharacterRow } from './CharacterRow';
import { CodePanel } from './CodePanel';

type Phase = 'idle' | 'running' | 'done';

export const LearnMode: React.FC = () => {
  const [inputValue, setInputValue] = useState('()[]{}');
  const [customInput, setCustomInput] = useState('');
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [phase, setPhase] = useState<Phase>('idle');
  const [playing, setPlaying] = useState(false);
  const [balanced, setBalanced] = useState<boolean | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadInput = useCallback((value: string) => {
    setInputValue(value);
    const result = computeSteps(value);
    setSteps(result.steps);
    setCurrentStep(-1);
    setPhase('idle');
    setPlaying(false);
    setBalanced(null);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
  }, []);

  useEffect(() => {
    loadInput('()[]{}');
  }, [loadInput]);

  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const currentStack = currentStepData ? currentStepData.action.stackAfter : [];
  const actionType = currentStepData?.action.type as 'push' | 'pop' | 'mismatch' | 'skip' | undefined;
  const isLastStep = currentStep === steps.length - 1;
  const highlightTopColor =
    actionType === 'pop' ? 'green' : actionType === 'mismatch' ? 'red' : undefined;

  const advance = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next >= steps.length) {
        setPhase('done');
        setPlaying(false);
        const result = computeSteps(inputValue);
        setBalanced(result.balanced);
        return prev;
      }
      setPhase('running');
      return next;
    });
  }, [steps.length, inputValue]);

  const goBack = useCallback(() => {
    if (currentStep <= 0) {
      setCurrentStep(-1);
      setPhase('idle');
      setBalanced(null);
      return;
    }
    setCurrentStep(prev => prev - 1);
    setPhase('running');
    setBalanced(null);
  }, [currentStep]);

  const reset = useCallback(() => {
    setCurrentStep(-1);
    setPhase('idle');
    setPlaying(false);
    setBalanced(null);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (phase === 'done') {
      setPlaying(false);
      return;
    }
    playTimerRef.current = setTimeout(() => {
      advance();
    }, 1200);
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [playing, currentStep, phase, advance]);

  const togglePlay = () => {
    if (phase === 'done') {
      reset();
      setPlaying(true);
      return;
    }
    setPlaying(p => !p);
    if (phase === 'idle') {
      setPhase('running');
    }
  };

  const handleCustomInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      loadInput(customInput);
    }
  };

  const activeLine = currentStepData?.codeLine ?? (phase === 'done' ? 12 : 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Preset selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Choose an example
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_STRINGS.map(preset => (
            <button
              key={preset.value}
              onClick={() => loadInput(preset.value)}
              className={`px-4 py-2 rounded-full text-sm font-mono font-semibold border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                inputValue === preset.value
                  ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-teal-400 hover:text-teal-700'
              }`}
            >
              {preset.label}
              <span
                className={`ml-2 text-xs ${
                  inputValue === preset.value ? 'text-teal-100' : preset.balanced ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {preset.balanced ? '✓' : '✗'}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomInput} className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="Type your own string, e.g. {[()]}"
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:border-teal-400 transition-colors"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            Try It
          </button>
        </form>
      </div>

      {/* Main visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: visualization */}
        <div className="lg:col-span-2 space-y-4">
          {/* Input string */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Input String
            </h3>
            <CharacterRow
              input={inputValue}
              currentIndex={currentStepData?.charIndex ?? -1}
              processedUpTo={currentStepData ? currentStepData.charIndex : -1}
              actionType={actionType}
            />
          </div>

          {/* Stack + caption */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex gap-6 items-start">
              <StackVisual
                stack={currentStack as string[]}
                highlightTop={actionType === 'pop' || actionType === 'mismatch'}
                highlightColor={highlightTopColor}
              />
              <div className="flex-1 space-y-3">
                <div className="min-h-[80px] flex items-center">
                  <AnimatePresence mode="wait">
                    {currentStepData ? (
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className={`text-base font-medium rounded-xl px-4 py-3 border-l-4 ${
                          actionType === 'push'
                            ? 'bg-teal-50 border-teal-400 text-teal-800'
                            : actionType === 'pop'
                            ? 'bg-green-50 border-green-400 text-green-800'
                            : actionType === 'mismatch'
                            ? 'bg-red-50 border-red-400 text-red-800'
                            : 'bg-amber-50 border-amber-400 text-amber-800'
                        }`}
                      >
                        {currentStepData.caption}
                      </motion.div>
                    ) : phase === 'idle' ? (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-400 text-sm italic"
                      >
                        Press Play or Next to start the walkthrough.
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {/* Result banner */}
                <AnimatePresence>
                  {phase === 'done' && balanced !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`rounded-xl px-6 py-4 text-center font-bold text-lg ${
                        balanced
                          ? 'bg-green-100 border-2 border-green-400 text-green-800'
                          : 'bg-red-100 border-2 border-red-400 text-red-800'
                      }`}
                    >
                      {balanced ? '✓ Balanced!' : '✗ Unbalanced'}
                      {!balanced && currentStepData?.action.type === 'mismatch' && (
                        <p className="text-sm font-normal mt-1 text-red-600">
                          Bracket mismatch detected
                        </p>
                      )}
                      {!balanced && currentStepData?.action.type !== 'mismatch' && currentStack.length > 0 && (
                        <p className="text-sm font-normal mt-1 text-red-600">
                          Unclosed brackets remain: {currentStack.join(' ')}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                disabled={phase === 'idle'}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                ↺ Reset
              </button>
              <button
                onClick={goBack}
                disabled={phase === 'idle' || currentStep < 0}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                ← Previous
              </button>
              <button
                onClick={togglePlay}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                  playing
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500'
                    : 'bg-teal-500 hover:bg-teal-600 text-white border-2 border-teal-500'
                }`}
              >
                {playing ? '⏸ Pause' : phase === 'done' ? '↺ Replay' : '▶ Play'}
              </button>
              <button
                onClick={advance}
                disabled={phase === 'done' || (isLastStep && phase === 'running')}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm border-2 border-teal-300 text-teal-700 hover:border-teal-400 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                Next →
              </button>
            </div>

            {/* Step counter */}
            <div className="text-center mt-2 text-xs text-gray-400 font-mono">
              {phase === 'idle'
                ? `${steps.length} steps to walk through`
                : phase === 'done'
                ? 'Done!'
                : `Step ${currentStep + 1} of ${steps.length}`}
            </div>
          </div>
        </div>

        {/* Right: code panel */}
        <div className="lg:col-span-1">
          <CodePanel activeLine={activeLine} phase={phase} />
        </div>
      </div>
    </div>
  );
};
