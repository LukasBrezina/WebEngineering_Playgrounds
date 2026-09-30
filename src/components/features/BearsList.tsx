import { type Bear } from '../../models/bear.js';
import React from 'react';

interface BearProperties {
  bears: Bear[];
}

export function BearsList({ bears }: BearProperties): React.JSX.Element {
  return (
    <>
      {bears.map((bear) => (
        <div className="bear" key={bear.name}>
          <img
            src={bear.image}
            alt={bear.name}
            style={{ width: '200px', height: 'auto' }}
          />

          <p>
            <b>{bear.name}</b> ({bear.binomial})
          </p>

          <p>Range: {bear.range}</p>
        </div>
      ))}
    </>
  );
}
