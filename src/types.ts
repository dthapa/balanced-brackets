export type BracketChar = '(' | '[' | '{' | ')' | ']' | '}';
export type OpenBracket = '(' | '[' | '{';
export type CloseBracket = ')' | ']' | '}';

export type StepAction =
  | { type: 'push'; char: OpenBracket; stackAfter: OpenBracket[] }
  | { type: 'pop'; char: CloseBracket; matched: OpenBracket; stackAfter: OpenBracket[] }
  | { type: 'mismatch'; char: CloseBracket; stackTop: OpenBracket | null; stackAfter: OpenBracket[] }
  | { type: 'skip'; char: string; stackAfter: OpenBracket[] };

export interface AlgorithmStep {
  charIndex: number;
  char: string;
  action: StepAction;
  codeLine: number;
  caption: string;
}

export interface AlgorithmResult {
  steps: AlgorithmStep[];
  balanced: boolean;
}

export type AppMode = 'learn' | 'practice';
export type PracticeTab = 'push-or-pop' | 'code-fill' | 'reconstruct' | 'trace';
