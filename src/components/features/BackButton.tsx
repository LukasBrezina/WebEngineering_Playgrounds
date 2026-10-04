import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function BackButton(): React.JSX.Element {
  const navigate = useNavigate();
  const { search } = useLocation();

  return (
    <button
      type="button"
      className="back-button"
      onClick={() => {
        void navigate({ pathname: '/', search }); // void marks a promise as ignored
      }}
    >
      ← Back
    </button>
  );
}
