import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StackVisualProps {
  stack: string[];
  highlightTop?: boolean;
  highlightColor?: 'green' | 'red';
}

const OPENER_COLORS: Record<string, string> = {
  '(': 'bg-teal-500 border-teal-400 text-white',
  '[': 'bg-teal-600 border-teal-500 text-white',
  '{': 'bg-teal-700 border-teal-600 text-white',
};

export const StackVisual: React.FC<StackVisualProps> = ({ stack, highlightTop, highlightColor }) => {
  const isEmpty = stack.length === 0;

  return (
    <div className="flex flex-col items-center gap-2 min-w-[100px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Stack</span>
      </div>

      <div className="relative border-2 border-gray-300 rounded-xl bg-gray-50 w-20 min-h-[200px] flex flex-col-reverse items-center justify-start p-2 gap-1.5 overflow-hidden">
        {/* TOP indicator */}
        <div className="absolute top-1 left-0 right-0 flex justify-center">
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">TOP</span>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-gray-400 text-center px-1">empty</span>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {stack.map((ch, i) => {
            const isTop = i === stack.length - 1;
            const colorClass = OPENER_COLORS[ch] || 'bg-teal-500 border-teal-400 text-white';
            const highlight = isTop && highlightTop;
            const highlightClass =
              highlight && highlightColor === 'green'
                ? 'ring-4 ring-green-400 scale-110'
                : highlight && highlightColor === 'red'
                ? 'ring-4 ring-red-400 scale-110'
                : '';

            return (
              <motion.div
                key={`${ch}-${i}`}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`w-14 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold font-mono cursor-default select-none transition-all duration-200 ${colorClass} ${highlightClass}`}
              >
                {ch}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="text-xs text-gray-400 font-mono">
        {isEmpty ? '[ ]' : `[${stack.join(', ')}]`}
      </div>
    </div>
  );
};
