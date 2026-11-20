import { API_BASE_URL, checkResponseOk } from './api';

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export const register = async (
  email: string,
  password: string
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  await checkResponseOk(response);
  return (await response.json()) as User;
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  await checkResponseOk(response);
  return (await response.json()) as User;
};

export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
  });
  await checkResponseOk(response);
};

export const getMe = async (signal?: AbortSignal): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, { signal });
  if (response.status === 401) return null;
  await checkResponseOk(response);
  return (await response.json()) as User;
};
