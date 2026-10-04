import { Search } from '../features/Search.js';
import React from 'react';

export function NavigationList(): React.JSX.Element {
  return (
    <nav>
      <ul>
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#">Our team</a>
        </li>
        <li>
          <a href="#">Projects</a>
        </li>
        <li>
          <a href="#">Blog</a>
        </li>
      </ul>

      <Search />
    </nav>
  );
}
