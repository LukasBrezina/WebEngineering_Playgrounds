import React, { type FormEvent, useState } from 'react';

interface SearchProperties {
  onSearch: (searchTerm: string) => void;
}

export function Search({ onSearch }: SearchProperties): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const term = searchTerm.trim();

    if (term === '') {
      alert('Please enter a search term.');
      return;
    }

    onSearch(term);
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
