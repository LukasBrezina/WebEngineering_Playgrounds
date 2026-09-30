import React, { useEffect, useState } from 'react';
import { type Bear } from './models/bear.js';
import { initializeBearsApi } from './api/bears.js';
import { Article } from './components/layout/Article.js';
import { Secondary } from './components/layout/Secondary.js';
import { Header } from './components/layout/Header.js';
import { NavigationList } from './components/layout/NavigationList.js';
import { Footer } from './components/layout/Footer.js';

export function App(): React.JSX.Element {
  const [bears, setBears] = useState<Bear[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    initializeBearsApi()
      .then((bears: Bear[]) => {
        setBears(bears);
      })
      .catch((error: Error) => {
        console.error('Error initializing bears API:', error);
        setError(error);
      });
  }, []);

  return (
    <>
      <Header />

      <NavigationList setSearchTerm={setSearchTerm} />

      <main>
        <Article searchTerm={searchTerm} error={error} bears={bears} />
        <Secondary />
      </main>

      <Footer />
    </>
  );
}
