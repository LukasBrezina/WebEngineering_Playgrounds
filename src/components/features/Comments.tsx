import React, { useState, type FormEvent } from 'react';

interface Comment {
  name: string;
  comment: string;
}

export function Comments(): React.JSX.Element {
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);

  const [comments, setComments] = useState<Comment[]>([
    {
      name: 'Bob Fossil',
      comment:
        'Oh I am so glad you taught me all about the big brown angry guys...',
    },
  ]);

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (name.trim() === '' || comment.trim() === '') {
      alert('Please fill in both fields: Name and Comment');
      return;
    }

    const newComment: Comment = {
      name: name.trim(),
      comment: comment.trim(),
    };

    setComments((currentComments) => [...currentComments, newComment]);

    setName('');
    setComment('');
  };

  return (
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

      <div className={`comment-wrapper ${areCommentsVisible ? 'active' : ''}`}>
        <h2>Add comment</h2>

        <form className="comment-form" onSubmit={handleSubmit}>
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

        <div className="comment-container">
          <h2>Comments</h2>

          <ul>
            {comments.map((comment, index) => (
              <li key={index}>
                <p>{comment.name}</p>
                <p>{comment.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
