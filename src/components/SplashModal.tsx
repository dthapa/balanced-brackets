import React from 'react';
import { motion } from 'framer-motion';

interface SplashModalProps {
  onDismiss: () => void;
}

export const SplashModal: React.FC<SplashModalProps> = ({ onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <div className="text-6xl mb-4">🧱</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Balanced Brackets</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Learn how a <strong className="text-teal-600">stack</strong> checks whether brackets are balanced —
          then test yourself with four hands-on challenges.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
            <div className="text-2xl mb-1">📚</div>
            <p className="font-semibold text-teal-800 text-sm">Learn Mode</p>
            <p className="text-xs text-teal-600 mt-1">
              Watch the algorithm step-by-step with animated push & pop
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="text-2xl mb-1">🎮</div>
            <p className="font-semibold text-orange-800 text-sm">Practice Mode</p>
            <p className="text-xs text-orange-600 mt-1">
              Four challenge types to solidify your understanding
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-base transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Let's Start! →
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Perfect for beginners and coding interview prep
        </p>
      </motion.div>
    </motion.div>
  );
};
