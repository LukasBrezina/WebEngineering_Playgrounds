import React, { useEffect, useState } from 'react';
import { Highlight } from './Highlight.js';
import { useParams } from 'react-router-dom';
import { type Bear } from '../../models/bear.js';
import { fetchBear } from '../../api/bears.js';
import { ApiError } from '../errors/ApiError.js';
import { BackButton } from './BackButton.js';

type DetailState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notFound' }
  | { status: 'success'; bear: Bear };

export function BearDetail(): React.JSX.Element {
  const { bearId } = useParams();
  const [state, setState] = useState<DetailState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetchBear(bearId ?? '', controller.signal)
      .then((bear) => {
        setState(
          bear === null ? { status: 'notFound' } : { status: 'success', bear }
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' });
      });

    return () => {
      controller.abort();
    };
  }, [bearId]);

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
    if (state.status === 'notFound') {
      return (
        <>
          <p>Bear not found.</p>
          <BackButton />
        </>
      );
    }

    const { bear } = state;
    return (
      <>
        <BackButton />
        <Highlight>
          <h2>{bear.name}</h2>
          <img
            src={bear.imageUrl}
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
