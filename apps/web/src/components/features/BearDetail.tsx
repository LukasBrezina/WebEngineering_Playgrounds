import React, { useEffect, useState } from 'react';
import { Highlight } from './Highlight.js';
import { useParams } from 'react-router-dom';
import { type Bear } from '../../models/bear.js';
import { fetchBear } from '../../api/bears.js';
import { ApiError, errorMessage } from '../../api/api.js';
import { BackButton } from './BackButton.js';
import { Comments } from './Comments.js';

type DetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'notFound'; message: string }
  | { status: 'success'; bear: Bear };

export function BearDetail(): React.JSX.Element {
  const { bearId } = useParams();
  const [state, setState] = useState<DetailState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetchBear(bearId ?? '', controller.signal)
      .then((bear) => {
        setState({ status: 'success', bear });
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        if (e instanceof ApiError && e.status === 404) {
          setState({ status: 'notFound', message: e.message });
          return;
        }
        setState({
          status: 'error',
          message: errorMessage(e, 'Could not load bear.'),
        });
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
    if (state.status === 'error') {
      return (
        <>
          <BackButton />
          <p role="alert">{state.message}</p>
        </>
      );
    }
    if (state.status === 'notFound') {
      return (
        <>
          <p>{state.message}</p>
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
        <Comments bearId={bear.id} />
      </>
    );
  }

  return <article>{renderContent()}</article>;
}
