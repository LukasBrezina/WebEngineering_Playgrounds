import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ITEMS = [{ to: '/register', label: 'Register' }];

export function AccountMenu(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="account-menu">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="account-menu-list"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        Account ▾
      </button>

      {isOpen && (
        <ul id="account-menu-list">
          {ITEMS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
