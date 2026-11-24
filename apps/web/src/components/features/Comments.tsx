import React, { type FormEvent, useEffect, useState } from 'react';
import { Highlight } from './Highlight.js';
import {
  getComments,
  type Comment,
  deleteComment,
  createComment,
} from '../../api/comments';
import { errorMessage } from '../../api/api';
import { type User } from '../../api/auth';

export function Comments({
  bearId,
  user,
}: {
  bearId: string;
  user: User | null;
}): React.JSX.Element {
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let stale = false;
    setComments([]);
    setNextCursor(null);
    setError('');
    getComments(bearId)
      .then((page) => {
        if (stale) return;
        setComments(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((e: unknown) => {
        if (!stale) setError(errorMessage(e, 'Could not load comments.'));
      });
    return () => {
      stale = true;
    };
  }, [bearId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (name.trim() === '' || comment.trim() === '') {
      setError('Please fill in both fields: Name and Comment');
      return;
    }

    try {
      const newComment = await createComment(
        bearId,
        name.trim(),
        comment.trim()
      );
      if (nextCursor === null) {
        setComments((current) => [...current, newComment]);
      }
      setName('');
      setComment('');
      setError('');
    } catch (e) {
      setError(errorMessage(e, 'Could not submit comment.'));
    }
  };

  const handleLoadMore = async (): Promise<void> => {
    if (nextCursor === null) return;
    setIsLoadingMore(true);
    try {
      const page = await getComments(bearId, nextCursor);
      setComments((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
      setError('');
    } catch (e) {
      setError(errorMessage(e, 'Could not load more comments.'));
    } finally {
      setIsLoadingMore(false);
    }
  };

  // reflects server rule, only author and moderator can delete
  const canDelete = (c: Comment): boolean =>
    user !== null && (user.role === 'moderator' || c.authorId === user.id);

  const handleDelete = async (commentId: string): Promise<void> => {
    try {
      await deleteComment(commentId);
      setComments((current) => current.filter((c) => c.id !== commentId));
      setError('');
    } catch (e) {
      setError(errorMessage(e, 'Could not delete comment.'));
    }
  };

  return (
    <Highlight>
      <section className="comments">
        <button
          className="show-hide"
          onClick={() => {
            setAreCommentsVisible(!areCommentsVisible);
          }}
          aria-expanded={areCommentsVisible}
        >
          {areCommentsVisible ? 'Hide comments' : 'Show comments'}
        </button>

        <div
          className={`comment-wrapper ${areCommentsVisible ? 'active' : ''}`}
        >
          <h2>Add comment</h2>

          <form
            className="comment-form"
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
          >
            <div className="flex-pair">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                required
              />
            </div>

            <div className="flex-pair">
              <label htmlFor="comment">Comment:</label>
              <input
                name="comment"
                id="comment"
                placeholder="Enter your comment"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
                required
              />
            </div>

            <div>
              <input type="submit" value="Submit comment" />
            </div>
          </form>

          {error !== '' && <p role="alert">{error}</p>}

          <div className="comment-container">
            <h2>Comments</h2>

            <ul>
              {comments.map((c) => (
                <li key={c.id}>
                  <p>{c.author}</p>
                  <p>{c.text}</p>
                  {canDelete(c) && (
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(c.id);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {nextCursor !== null && (
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={() => {
                  void handleLoadMore();
                }}
              >
                {isLoadingMore ? 'Loading...' : 'Load more comments'}
              </button>
            )}
          </div>
        </div>
      </section>
    </Highlight>
  );
}
