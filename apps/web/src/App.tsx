import React, { useEffect, useState } from 'react';
import { type Bear } from './models/bear.js';
import { initializeBearsApi } from './api/bears.js';
import { errorMessage } from './api/api.js';
import { Article } from './components/layout/Article.js';
import { Secondary } from './components/layout/Secondary.js';
import { Header } from './components/layout/Header.js';
import { NavigationList } from './components/layout/NavigationList.js';
import { Footer } from './components/layout/Footer.js';
import { type State } from './models/state.js';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { getMe, logout, type User } from './api/auth.js';
import { Login } from './components/features/Login.js';
import { Me } from './components/features/Me.js';
import { BearDetail } from './components/features/BearDetail.js';
import { BackButton } from './components/features/BackButton.js';
import { Highlight } from './components/features/Highlight.js';
import { Register } from './components/features/Register.js';

export function App(): React.JSX.Element {
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ status: 'loading' });

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
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: errorMessage(e, 'Could not load bears.'),
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  // logged-in user from the session cookie (null = not logged in)
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getMe(controller.signal)
      .then(setUser)
      .catch(() => {
        if (!controller.signal.aborted) setUser(null);
      });
    return () => {
      controller.abort();
    };
  }, []);

  const handleLogout = async (): Promise<void> => {
    await logout();
    setUser(null);
    void navigate('/');
  };

  return (
    <>
      <Header />

      <NavigationList user={user} onLogout={handleLogout} />

      <main>
        <Routes>
          <Route path="/" element={<Article state={state} />} />
          <Route path="/bears/:bearId" element={<BearDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/me" element={<Me user={user} />} />
          <Route
            path="*"
            element={
              <article>
                <BackButton />
                <Highlight>
                  <h2>Page not found</h2>
                  <p>The page you are looking for does not exist.</p>
                </Highlight>
              </article>
            }
          />
        </Routes>
        <Secondary />
      </main>

      <Footer />
    </>
  );
}
