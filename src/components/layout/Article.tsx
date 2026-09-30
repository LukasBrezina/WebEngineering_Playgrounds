import { Comments } from '../features/Comments.js';
import { ApiError } from '../errors/ApiError.js';
import { BearsList } from '../features/BearsList.js';
import { type Bear } from '../../models/bear.js';
import React, { useEffect, useRef } from 'react';
import { highlightNode, removeHighlights } from '../../utils/highlightUtils.js';
import { Introduction } from './article/Introduction.js';
import { BearInformation } from './article/BearInformation.js';
import { AuthorInformation } from './article/AuthorInformation.js';

interface ArticleProperties {
  searchTerm: string;
  error: Error | null;
  bears: Bear[];
}

export function Article({
  searchTerm,
  error,
  bears,
}: ArticleProperties): React.JSX.Element {
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const article = articleRef.current;

    if (article === null) {
      return;
    }

    removeHighlights(article);

    if (searchTerm === '') {
      return;
    }

    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

    highlightNode(article, regex);
  }, [searchTerm]);

  return (
    <article ref={articleRef}>
      <Introduction />
      <BearInformation />
      <AuthorInformation />
      <Comments />

      <section className="more_bears">
        <h3>More Bears</h3>

        {error != null ? <ApiError /> : <BearsList bears={bears} />}
      </section>
    </article>
  );
}
