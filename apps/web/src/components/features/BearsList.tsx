import { type Bear } from '../../models/bear.js';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Highlight } from './Highlight.js';

interface BearProperties {
  bears: Bear[];
}

export function BearsList({ bears }: BearProperties): React.JSX.Element {
  const location = useLocation();
  return (
    <Highlight>
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
              <b>
                <Highlight>{bear.name}</Highlight>
              </b>
            </Link>{' '}
            (<Highlight>{bear.binomial}</Highlight>)
          </p>

          <p>
            Range: <Highlight>{bear.range}</Highlight>
          </p>
        </div>
      ))}
    </Highlight>
  );
}
