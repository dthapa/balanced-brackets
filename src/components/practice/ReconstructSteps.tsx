import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Step {
  id: string;
  text: string;
  correctIndex: number;
}

const CORRECT_ORDER: Step[] = [
  { id: 's1', text: 'Initialize an empty stack and a matching dictionary', correctIndex: 0 },
  { id: 's2', text: 'For each character in the input string', correctIndex: 1 },
  { id: 's3', text: 'If the character is an opening bracket, push it onto the stack', correctIndex: 2 },
  { id: 's4', text: 'If the character is a closing bracket, check the top of the stack', correctIndex: 3 },
  { id: 's5', text: 'If the stack is empty or the top doesn\'t match, return False (unbalanced)', correctIndex: 4 },
  { id: 's6', text: 'Otherwise, pop the top of the stack (matched pair!)', correctIndex: 5 },
  { id: 's7', text: 'After all characters, return True only if the stack is empty', correctIndex: 6 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface SortableStepProps {
  step: Step;
  result?: 'correct' | 'wrong';
  correctPosition?: number;
  isDragging?: boolean;
}

const SortableStep: React.FC<SortableStepProps> = ({ step, result, correctPosition }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-grab active:cursor-grabbing select-none transition-colors ${
        result === 'correct'
          ? 'bg-green-50 border-green-400'
          : result === 'wrong'
          ? 'bg-red-50 border-red-400'
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
      }`}
      {...attributes}
      {...listeners}
    >
      <span className="text-gray-400 text-lg">⠿</span>
      <span className={`flex-1 text-sm font-medium ${
        result === 'correct' ? 'text-green-800' : result === 'wrong' ? 'text-red-800' : 'text-gray-700'
      }`}>
        {step.text}
      </span>
      {result === 'correct' && <span className="text-green-500 text-lg">✓</span>}
      {result === 'wrong' && (
        <span className="text-xs text-red-500 font-semibold whitespace-nowrap">
          → pos {(correctPosition ?? 0) + 1}
        </span>
      )}
    </motion.div>
  );
};

export const ReconstructSteps: React.FC = () => {
  const [items, setItems] = useState<Step[]>(() => shuffle(CORRECT_ORDER));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (submitted) {
      setSubmitted(false);
      setResults({});
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setItems(prev => {
        const oldIdx = prev.findIndex(s => s.id === active.id);
        const newIdx = prev.findIndex(s => s.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const handleSubmit = () => {
    const newResults: Record<string, 'correct' | 'wrong'> = {};
    items.forEach((step, i) => {
      newResults[step.id] = step.correctIndex === i ? 'correct' : 'wrong';
    });
    setResults(newResults);
    setSubmitted(true);
  };

  const handleReset = () => {
    setItems(shuffle(CORRECT_ORDER));
    setSubmitted(false);
    setResults({});
  };

  const allCorrect = submitted && items.every(s => results[s.id] === 'correct');
  const correctCount = submitted ? items.filter(s => results[s.id] === 'correct').length : 0;

  const activeStep = items.find(s => s.id === activeId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Reconstruct the Steps</h2>
        <p className="text-sm text-gray-500 mb-4">
          Drag the cards into the correct logical order for the balanced brackets algorithm.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map(step => (
                <SortableStep
                  key={step.id}
                  step={step}
                  result={submitted ? results[step.id] : undefined}
                  correctPosition={
                    submitted && results[step.id] === 'wrong' ? step.correctIndex : undefined
                  }
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeStep ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-teal-400 bg-teal-50 shadow-xl opacity-95">
                <span className="text-gray-400 text-lg">⠿</span>
                <span className="flex-1 text-sm font-medium text-teal-800">{activeStep.text}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AnimatePresence>
        {allCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center"
          >
            <p className="text-2xl font-bold text-green-700">🎉 Perfect order!</p>
            <p className="text-green-600 mt-1">You arranged all steps correctly!</p>
          </motion.div>
        )}
        {submitted && !allCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"
          >
            <p className="font-semibold text-amber-800">
              {correctCount}/{items.length} in the right position
            </p>
            <p className="text-sm text-amber-600 mt-1">Cards show the correct position for wrong ones.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 justify-center">
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Submit Order
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 border-2 border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Shuffle & Reset
        </button>
      </div>
    </div>
  );
};
