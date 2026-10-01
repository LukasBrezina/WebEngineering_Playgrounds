import React, { useRef } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { type State } from '../../models/state.js';
import { ApiError } from '../errors/ApiError.js';
import { useHighlight } from '../../utils/useHighlight.js';

interface BearDetailProperties {
  state: State;
}

export function BearDetail({ state }: BearDetailProperties): React.JSX.Element {
  const { bearId } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const articleRef = useRef<HTMLElement>(null);

  useHighlight(articleRef, params.get('q') ?? '', state);

  const backTo = { pathname: '/', search: location.search };

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
        <p>
          Bear not found. <Link to={backTo}>Back to list</Link>
        </p>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={() => {
            void navigate(backTo); // void marks a promise as ignored
          }}
        >
          Back
        </button>
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
      </>
    );
  }

  return <article ref={articleRef}>{renderContent()}</article>;
}
