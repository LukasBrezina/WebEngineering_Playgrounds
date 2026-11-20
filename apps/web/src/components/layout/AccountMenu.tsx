import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { type User } from '../../api/auth';

const LOGGED_OUT_ITEMS = [
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];
const LOGGED_IN_ITEMS = [{ to: '/me', label: 'Me' }];

export function AccountMenu({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => Promise<void>;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const items = user === null ? LOGGED_OUT_ITEMS : LOGGED_IN_ITEMS;

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
        {user === null ? 'Account' : user.email} ▾
      </button>

      {isOpen && (
        <ul id="account-menu-list">
          {items.map((item) => (
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
          {user !== null && (
            <li>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  void onLogout();
                }}
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
