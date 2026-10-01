import { type RefObject, useEffect } from 'react';
import { highlightNode, removeHighlights } from './highlightUtils.js';
import { type State } from '../models/state.js';

export function useHighlight(
  ref: RefObject<HTMLElement | null>,
  searchTerm: string,
  state: State
): void {
  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    removeHighlights(element);
    if (searchTerm === '') return;

    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    highlightNode(element, new RegExp(`(${escaped})`, 'gi'));
  }, [ref, searchTerm, state]);
}
