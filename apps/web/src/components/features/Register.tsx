import React, { type FormEvent, useState } from 'react';
import { Highlight } from './Highlight.js';
import { BackButton } from './BackButton.js';
import { register } from '../../api/auth';
import { errorMessage } from '../../api/api';

const PASSWORD_MIN = 12;

export function Register(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const user = await register(email.trim(), password);
      setRegisteredEmail(user.email);
      setEmail('');
      setPassword('');
      setError('');
    } catch (e) {
      setRegisteredEmail('');
      setError(errorMessage(e, 'Could not register.'));
    }
  };

  return (
    <article>
      <BackButton />
      <Highlight>
        <h2>Register</h2>

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
              autoComplete="new-password"
              minLength={PASSWORD_MIN}
              placeholder={`At least ${PASSWORD_MIN} characters`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
            />
          </div>

          <div>
            <input type="submit" value="Register" />
          </div>
        </form>

        {error !== '' && <p role="alert">{error}</p>}
        {registeredEmail !== '' && (
          <p role="status">Registered as {registeredEmail}.</p>
        )}
      </Highlight>
    </article>
  );
}
