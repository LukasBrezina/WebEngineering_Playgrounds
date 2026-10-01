import React, { useEffect, useState } from 'react';
import { type Bear } from './models/bear.js';
import { initializeBearsApi } from './api/bears.js';
import { Article } from './components/layout/Article.js';
import { Secondary } from './components/layout/Secondary.js';
import { Header } from './components/layout/Header.js';
import { NavigationList } from './components/layout/NavigationList.js';
import { Footer } from './components/layout/Footer.js';
import { type State } from './models/state.js';
import { Link, Route, Routes, useSearchParams } from 'react-router-dom';
import { BearDetail } from './components/features/BearDetail.js';

export function App(): React.JSX.Element {
  const [state, setState] = useState<State>({ status: 'loading' });

  const [params, setParams] = useSearchParams();
  const searchTerm = params.get('q') ?? '';
  const setSearchTerm = (q: string): void => {
    setParams(q === '' ? {} : { q }, { replace: true });
  };

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    initializeBearsApi(controller.signal)
      .then((bears: Bear[]) => {
        setState(
          bears.length === 0
            ? { status: 'empty' }
            : { status: 'success', bears }
        );
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return;
        }
        setState({ status: 'error', error });
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <Header />

      <NavigationList setSearchTerm={setSearchTerm} />

      <main>
        <Routes>
          <Route
            path="/"
            element={<Article searchTerm={searchTerm} state={state} />}
          />
          <Route path="/bears/:bearId" element={<BearDetail state={state} />} />
          <Route
            path="*"
            element={
              <p>
                Page not found. <Link to="/">Back to list</Link>
              </p>
            }
          />
        </Routes>
        <Secondary />
      </main>

      <Footer />
    </>
  );
}
