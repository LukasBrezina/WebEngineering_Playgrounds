import { Comments } from '../features/Comments.js';
import { ApiError } from '../errors/ApiError.js';
import { BearsList } from '../features/BearsList.js';
import React from 'react';
import { Introduction } from './article/Introduction.js';
import { BearInformation } from './article/BearInformation.js';
import { AuthorInformation } from './article/AuthorInformation.js';
import { type State } from '../../models/state.js';
import { Highlight } from '../features/Highlight.js';

interface ArticleProperties {
  state: State;
}

export function Article({ state }: ArticleProperties): React.JSX.Element {
  return (
    <article>
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
        <Highlight>
          <div role="status" aria-live="polite" className="loading">
            <span className="spinner" aria-hidden="true" />
            <p> Loading bears... </p>
          </div>
        </Highlight>
      );
    case 'empty':
      return (
        <Highlight>
          <p>No bears found.</p>;
        </Highlight>
      );
    case 'error':
      return <ApiError />;
    case 'success':
      return <BearsList bears={state.bears} />;
  }
}
