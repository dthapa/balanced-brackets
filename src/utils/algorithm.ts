import type { AlgorithmResult, AlgorithmStep, OpenBracket, CloseBracket } from '../types';

const OPENERS = new Set(['(', '[', '{']);
const CLOSERS = new Set([')', ']', '}']);
const MATCHING: Record<CloseBracket, OpenBracket> = {
  ')': '(',
  ']': '[',
  '}': '{',
};

export const CODE_LINES = [
  'def is_balanced(s):',         // 0
  '    stack = []',               // 1
  '    matching = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}',  // 2
  '',                             // 3
  '    for ch in s:',             // 4
  '        if ch in \'([{\':',    // 5
  '            stack.append(ch)', // 6
  '        elif ch in \')]}\':', // 7
  '            if not stack or stack[-1] != matching[ch]:', // 8
  '                return False', // 9
  '            stack.pop()',      // 10
  '',                             // 11
  '    return len(stack) == 0',   // 12
];

export function computeSteps(input: string): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const stack: OpenBracket[] = [];
  let balanced = true;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (OPENERS.has(ch)) {
      stack.push(ch as OpenBracket);
      steps.push({
        charIndex: i,
        char: ch,
        action: { type: 'push', char: ch as OpenBracket, stackAfter: [...stack] },
        codeLine: 6,
        caption: `Opening bracket "${ch}" — pushed onto stack!`,
      });
    } else if (CLOSERS.has(ch)) {
      const closer = ch as CloseBracket;
      const expected = MATCHING[closer];
      if (stack.length === 0 || stack[stack.length - 1] !== expected) {
        const stackTop = stack.length > 0 ? stack[stack.length - 1] : null;
        steps.push({
          charIndex: i,
          char: ch,
          action: { type: 'mismatch', char: closer, stackTop, stackAfter: [...stack] },
          codeLine: 9,
          caption:
            stack.length === 0
              ? `Closing bracket "${ch}" — but the stack is empty! Unbalanced.`
              : `Closing bracket "${ch}" doesn't match top of stack "${stack[stack.length - 1]}"! Unbalanced.`,
        });
        balanced = false;
        break;
      } else {
        const popped = stack.pop()!;
        steps.push({
          charIndex: i,
          char: ch,
          action: { type: 'pop', char: closer, matched: popped, stackAfter: [...stack] },
          codeLine: 10,
          caption: `Closing bracket "${ch}" matches "${popped}" at top of stack — popped!`,
        });
      }
    } else {
      steps.push({
        charIndex: i,
        char: ch,
        action: { type: 'skip', char: ch, stackAfter: [...stack] },
        codeLine: 4,
        caption: `"${ch}" is not a bracket — skipping.`,
      });
    }
  }

  if (balanced) {
    if (stack.length > 0) {
      balanced = false;
    }
  }

  return { steps, balanced };
}

export const PRESET_STRINGS = [
  { label: '()[]{}', value: '()[]{}', balanced: true },
  { label: '({[]})', value: '({[]})', balanced: true },
  { label: '(]', value: '(]', balanced: false },
  { label: '((())', value: '((())', balanced: false },
  { label: '{[()]}', value: '{[()]}', balanced: true },
  { label: '[({})]', value: '[({})]', balanced: true },
];

export { MATCHING, OPENERS, CLOSERS };
