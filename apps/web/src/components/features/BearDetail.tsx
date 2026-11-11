import React, { useEffect, useState } from 'react';
import { Highlight } from './Highlight.js';
import { useParams } from 'react-router-dom';
import { type Bear } from '../../models/bear.js';
import { fetchBear } from '../../api/bears.js';
import { errorMessage } from '../../api/api.js';
import { BackButton } from './BackButton.js';
import { Comments } from './Comments.js';

type DetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
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
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
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
        <Comments bearId={bear.id} />
      </>
    );
  }

  return <article>{renderContent()}</article>;
}
