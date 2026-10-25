import React from 'react';
import { Highlight } from '../features/Highlight.js';

export function ApiError(): React.JSX.Element {
  return (
    <Highlight>
      <p>
        Failed to load bear data. Please try again later. In the meantime, enjoy
        the bears from above.
      </p>
    </Highlight>
  );
}
