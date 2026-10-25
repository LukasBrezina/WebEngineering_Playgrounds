import React from 'react';

export function Secondary(): React.JSX.Element {
  return (
    <div className="secondary">
      <section className="related">
        <h2>Related</h2>

        <ul>
          <li>
            <a href="#">The trouble with Bees</a>
          </li>

          <li>
            <a href="#">The trouble with Otters</a>
          </li>

          <li>
            <a href="#">The trouble with Penguins</a>
          </li>

          <li>
            <a href="#">The trouble with Octopi</a>
          </li>

          <li>
            <a href="#">The trouble with Lemurs</a>
          </li>
        </ul>
      </section>
    </div>
  );
}
