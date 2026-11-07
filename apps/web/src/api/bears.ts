import type { Bear } from '../models/bear.js';
import { checkResponseOk } from './api';

export async function initializeBearsApi(
  signal?: AbortSignal
): Promise<Bear[]> {
  const response = await fetch('/api/bears', { signal });
  await checkResponseOk(response);
  return (await response.json()) as Bear[];
}

export async function fetchBear(
  id: string,
  signal?: AbortSignal
): Promise<Bear | null> {
  const response = await fetch(`/api/bears/${encodeURIComponent(id)}`, {
    signal,
  });
  if (response.status === 404) return null;
  await checkResponseOk(response);
  return (await response.json()) as Bear;
}
