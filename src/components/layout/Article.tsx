import { Comments } from '../features/Comments.js';
import { ApiError } from '../errors/ApiError.js';
import { BearsList } from '../features/BearsList.js';
import React, { useRef } from 'react';
import { Introduction } from './article/Introduction.js';
import { BearInformation } from './article/BearInformation.js';
import { AuthorInformation } from './article/AuthorInformation.js';
import { type State } from '../../models/state.js';
import { useHighlight } from '../../utils/useHighlight.js';

interface ArticleProperties {
  searchTerm: string;
  state: State;
}

export function Article({
  searchTerm,
  state,
}: ArticleProperties): React.JSX.Element {
  const articleRef = useRef<HTMLElement>(null);
  useHighlight(articleRef, searchTerm, state);

  return (
    <article ref={articleRef}>
      <Introduction />
      <BearInformation />
      <AuthorInformation />
      <Comments />

      <section className="more_bears">
        <h3>More Bears</h3>
        {renderContent(state)}
      </section>
    </article>
  );
}

function renderContent(state: State): React.JSX.Element {
  switch (state.status) {
    case 'loading':
      return (
        <div role="status" aria-live="polite" className="loading">
          <span className="spinner" aria-hidden="true" />
          <p> Loading bears... </p>
        </div>
      );
    case 'empty':
      return <p>No bears found.</p>;
    case 'error':
      return <ApiError />;
    case 'success':
      return <BearsList bears={state.bears} />;
  }
}
