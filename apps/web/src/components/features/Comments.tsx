import React, { type FormEvent, useEffect, useState } from 'react';
import { Highlight } from './Highlight.js';
import {
  getComments,
  type Comment,
  deleteComment,
  createComment,
} from '../../api/comments';
import { errorMessage } from '../../api/api';

export function Comments(): React.JSX.Element {
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async (): Promise<void> => {
      try {
        const data = await getComments();
        setComments(data);
        setError('');
      } catch (e) {
        setError(errorMessage(e, 'Could not load comments.'));
      }
    };
    void fetchComments();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (name.trim() === '' || comment.trim() === '') {
      alert('Please fill in both fields: Name and Comment');
      return;
    }

    try {
      const newComment = await createComment(name.trim(), comment.trim());

      setComments((currentComments) => [...currentComments, newComment]);

      setName('');
      setComment('');
      setError('');
    } catch (e) {
      setError(errorMessage(e, 'Could not submit comment.'));
    }
  };

  const handleDelete = async (commentId: string): Promise<void> => {
    try {
      await deleteComment(commentId);

      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId)
      );

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
              {comments.map((comment) => (
                <li key={comment.id}>
                  <p>{comment.author}</p>
                  <p>{comment.text}</p>

                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(comment.id);
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Highlight>
  );
}
