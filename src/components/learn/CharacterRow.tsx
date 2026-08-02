import React from 'react';
import { motion } from 'framer-motion';

interface CharacterRowProps {
  input: string;
  currentIndex: number;
  processedUpTo: number;
  actionType?: 'push' | 'pop' | 'mismatch' | 'skip';
}

function getTileColors(
  ch: string,
  index: number,
  currentIndex: number,
  processedUpTo: number,
  actionType?: string
): string {
  const isOpener = '([{'.includes(ch);
  const isCloser = ')]}'.includes(ch);
  const isActive = index === currentIndex;
  const isProcessed = index < processedUpTo;

  if (isActive) {
    if (actionType === 'push') return 'bg-teal-500 border-teal-400 text-white scale-110 shadow-lg shadow-teal-300';
    if (actionType === 'pop') return 'bg-green-500 border-green-400 text-white scale-110 shadow-lg shadow-green-300';
    if (actionType === 'mismatch') return 'bg-red-500 border-red-400 text-white scale-110 shadow-lg shadow-red-300';
    if (actionType === 'skip') return 'bg-amber-400 border-amber-300 text-gray-800 scale-105';
    return 'bg-amber-400 border-amber-300 text-gray-800 scale-105';
  }

  if (isProcessed) {
    return 'bg-gray-200 border-gray-300 text-gray-400 opacity-60';
  }

  if (isOpener) return 'bg-teal-100 border-teal-300 text-teal-800';
  if (isCloser) return 'bg-orange-100 border-orange-300 text-orange-800';
  return 'bg-gray-100 border-gray-300 text-gray-600';
}

export const CharacterRow: React.FC<CharacterRowProps> = ({
  input,
  currentIndex,
  processedUpTo,
  actionType,
}) => {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center items-center">
      {input.split('').map((ch, i) => {
        const colorClass = getTileColors(ch, i, currentIndex, processedUpTo, actionType);
        const isActive = i === currentIndex;

        return (
          <motion.div
            key={i}
            layout
            animate={
              isActive && actionType === 'mismatch'
                ? { x: [0, -6, 6, -6, 6, 0] }
                : { x: 0 }
            }
            transition={
              isActive && actionType === 'mismatch'
                ? { duration: 0.4, ease: 'easeInOut' }
                : { type: 'spring', stiffness: 300, damping: 20 }
            }
            className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center text-lg font-bold font-mono transition-all duration-200 select-none ${colorClass}`}
          >
            {ch}
          </motion.div>
        );
      })}
    </div>
  );
};
