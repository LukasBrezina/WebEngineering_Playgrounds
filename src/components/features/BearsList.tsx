import { type Bear } from '../../models/bear.js';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BearProperties {
  bears: Bear[];
}

export function BearsList({ bears }: BearProperties): React.JSX.Element {
  const location = useLocation();
  return (
    <>
      {bears.map((bear) => (
        <div className="bear" key={bear.id}>
          <img
            src={bear.image}
            alt={bear.name}
            style={{ width: '200px', height: 'auto' }}
          />

          <p>
            <Link
              to={{ pathname: `/bears/${bear.id}`, search: location.search }}
            >
              <b>{bear.name}</b>
            </Link>{' '}
            ({bear.binomial})
          </p>

          <p>Range: {bear.range}</p>
        </div>
      ))}
    </>
  );
}
