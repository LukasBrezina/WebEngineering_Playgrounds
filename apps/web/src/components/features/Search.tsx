import React, { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function Search(): React.JSX.Element {
  const [params, setParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(params.get('q') ?? '');

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const term = searchTerm.trim();

    if (term === '') {
      alert('Please enter a search term.');
      return;
    }

    setParams({ q: term }, { replace: true });
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        type="search"
        name="inputField"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      />
      <button type="submit">Search</button>
    </form>
  );
}
