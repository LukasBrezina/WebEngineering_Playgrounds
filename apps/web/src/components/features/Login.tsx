import React, { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Highlight } from './Highlight.js';
import { BackButton } from './BackButton.js';
import { login, type User } from '../../api/auth';
import { errorMessage } from '../../api/api';

export function Login({
  onLogin,
}: {
  onLogin: (user: User) => void;
}): React.JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const user = await login(email.trim(), password);
      onLogin(user);
      void navigate('/me');
    } catch (e) {
      setError(errorMessage(e, 'Could not log in.'));
    }
  };

  return (
    <article>
      <BackButton />
      <Highlight>
        <h2>Login</h2>

        <form
          className="comment-form"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <div className="flex-pair">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
            />
          </div>

          <div className="flex-pair">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
            />
          </div>

          <div>
            <input type="submit" value="Login" />
          </div>
        </form>

        {error !== '' && <p role="alert">{error}</p>}
      </Highlight>
    </article>
  );
}
