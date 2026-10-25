import React from 'react';
import { Highlight } from '../../features/Highlight.js';

export function AuthorInformation(): React.JSX.Element {
  return (
    <Highlight>
      <section className="author-information">
        <div className="author-wrapper">
          <h3>About the author</h3>

          <p>Evan Wild is an unemployed plumber from Doncaster...</p>
        </div>
      </section>
    </Highlight>
  );
}
