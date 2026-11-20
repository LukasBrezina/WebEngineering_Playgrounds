import React from 'react';
import { Highlight } from './Highlight.js';
import { BackButton } from './BackButton.js';
import { type User } from '../../api/auth';

export function Me({ user }: { user: User | null }): React.JSX.Element {
  return (
    <article>
      <BackButton />
      <Highlight>
        <h2>Me</h2>
        {user === null ? (
          <p>You are not logged in.</p>
        ) : (
          <dl>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Role</dt>
            <dd>{user.role}</dd>
            <dt>Registered</dt>
            <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
          </dl>
        )}
      </Highlight>
    </article>
  );
}
