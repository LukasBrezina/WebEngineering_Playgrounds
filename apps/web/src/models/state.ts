import type { Bear } from './bear.js';

export type State =
  | { status: 'loading' }
  | { status: 'success'; bears: Bear[] }
  | { status: 'empty' }
  | { status: 'error'; error: Error };
