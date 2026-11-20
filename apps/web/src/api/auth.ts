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
