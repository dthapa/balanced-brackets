import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { computeSteps, PRESET_STRINGS } from '../../utils/algorithm';
import type { AlgorithmStep } from '../../types';
import { StackVisual } from '../learn/StackVisual';

function buildChallengeSteps(input: string): AlgorithmStep[] {
  const result = computeSteps(input);
  return result.steps.filter(s => s.action.type !== 'skip');
}

interface DraggableCharProps {
  ch: string;
  id: string;
}

const DraggableChar: React.FC<DraggableCharProps> = ({ ch, id }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  const isOpener = '([{'.includes(ch);

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-mono cursor-grab active:cursor-grabbing select-none transition-all ${
        isDragging ? 'opacity-0' : ''
      } ${
        isOpener
          ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-200'
          : 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-200'
      }`}
    >
      {ch}
    </motion.div>
  );
};

interface DropZoneProps {
  id: string;
  label: string;
  icon: string;
  color: string;
  isOver: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ id, label, icon, color, isOver }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[100px] rounded-2xl border-3 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
        isOver
          ? `${color} border-solid shadow-inner scale-105`
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <span className={`font-bold text-sm uppercase tracking-wider ${isOver ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
};

interface FeedbackState {
  correct: boolean;
  message: string;
}

export const PushOrPop: React.FC = () => {
  const [presetIndex, setPresetIndex] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>(() => buildChallengeSteps(PRESET_STRINGS[0].value));
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [activeChar, setActiveChar] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const loadPreset = useCallback((idx: number) => {
    const newSteps = buildChallengeSteps(PRESET_STRINGS[idx].value);
    setSteps(newSteps);
    setPresetIndex(idx);
    setStepIndex(0);
    setFeedback(null);
    setScore({ correct: 0, total: 0 });
    setDone(false);
  }, []);

  const currentStep = steps[stepIndex];
  // The stack BEFORE this step (we show what was there before the action)
  const stackBefore = stepIndex > 0
    ? steps[stepIndex - 1].action.stackAfter
    : [];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveChar(event.active.id as string);
  };

  const handleDragOver = (event: { over: { id: string } | null }) => {
    setDragOverId(event.over?.id ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragOverId(null);
    setActiveChar(null);
    const { over } = event;
    if (!over || !currentStep || done) return;

    const dropZone = over.id as string;
    const action = currentStep.action.type;
    const correct =
      (dropZone === 'push' && action === 'push') ||
      (dropZone === 'pop' && (action === 'pop' || action === 'mismatch'));

    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));

    if (correct) {
      setFeedback({ correct: true, message: action === 'push' ? 'Correct! Push it onto the stack.' : 'Correct! Pop the top.' });
      setTimeout(() => {
        setFeedback(null);
        const next = stepIndex + 1;
        if (next >= steps.length) {
          setDone(true);
        } else {
          setStepIndex(next);
        }
      }, 900);
    } else {
      const hint =
        action === 'push'
          ? `"${currentStep.char}" is an opener — it goes on the stack (Push).`
          : `"${currentStep.char}" is a closer — check the top and pop (Pop).`;
      setFeedback({ correct: false, message: hint });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">Challenge Complete!</h2>
        <p className="text-gray-600">
          Score: <span className="font-bold text-teal-600">{score.correct}/{score.total}</span>
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {PRESET_STRINGS.map((p, i) => (
            <button
              key={i}
              onClick={() => loadPreset(i)}
              className="px-4 py-2 rounded-xl border-2 border-teal-300 text-teal-700 font-mono font-semibold hover:bg-teal-50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
          <span className="text-sm text-gray-500">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-semibold text-teal-600">
            {score.correct}/{score.total} correct
          </span>
        </div>

        <div className="flex gap-6 items-start justify-center">
          <StackVisual stack={stackBefore as string[]} />

          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600 font-medium">Current character:</p>
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver as never}
              onDragEnd={handleDragEnd}
            >
              <DraggableChar ch={currentStep.char} id={`char-${stepIndex}`} />

              <div className="flex gap-3 w-full">
                <DropZone
                  id="push"
                  label="Push"
                  icon="⬇"
                  color="bg-teal-500"
                  isOver={dragOverId === 'push'}
                />
                <DropZone
                  id="pop"
                  label="Pop"
                  icon="⬆"
                  color="bg-orange-500"
                  isOver={dragOverId === 'pop'}
                />
              </div>

              <DragOverlay>
                {activeChar ? (
                  <div className="w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-mono bg-teal-500 border-teal-400 text-white shadow-2xl opacity-90 cursor-grabbing">
                    {activeChar.charAt(0)}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            <p className="text-xs text-gray-400 italic">Drag the character to Push or Pop</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl px-5 py-3 text-center font-semibold border-2 ${
              feedback.correct
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-red-50 border-red-400 text-red-800'
            }`}
          >
            {feedback.correct ? '✓ ' : '✗ '}{feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

