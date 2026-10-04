import React from 'react';
import { Highlight } from './Highlight.js';
import { useParams } from 'react-router-dom';
import { type State } from '../../models/state.js';
import { ApiError } from '../errors/ApiError.js';
import { BackButton } from './BackButton.js';

interface BearDetailProperties {
  state: State;
}

export function BearDetail({ state }: BearDetailProperties): React.JSX.Element {
  const { bearId } = useParams();

  function renderContent(): React.JSX.Element {
    if (state.status === 'loading') {
      return (
        <div role="status" aria-live="polite" className="loading">
          <span className="spinner" aria-hidden="true" />
          <p>Loading bear...</p>
        </div>
      );
    }
    if (state.status === 'error') return <ApiError />;

    const bear =
      state.status === 'success'
        ? state.bears.find((b) => b.id === bearId)
        : undefined;

    if (bear === undefined) {
      return (
        <>
          <p>Bear not found.</p>
          <BackButton />
        </>
      );
    }

    return (
      <>
        <BackButton />
        <Highlight>
          <h2>{bear.name}</h2>
          <img
            src={bear.image}
            alt={bear.name}
            style={{ width: '300px', height: 'auto' }}
          />
          <p>
            <i>{bear.binomial}</i>
          </p>
          <p>Range: {bear.range}</p>
        </Highlight>
      </>
    );
  }

  return <article>{renderContent()}</article>;
}
