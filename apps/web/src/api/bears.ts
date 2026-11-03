import type { Bear } from '../models/bear.js';

export async function initializeBearsApi(
  signal?: AbortSignal
): Promise<Bear[]> {
  const response = await fetch('/api/bears', { signal });
  if (!response.ok) {
    throw new Error(`Bears API request failed with status ${response.status}`);
  }
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
  if (!response.ok) {
    throw new Error(`Bear API request failed with status ${response.status}`);
  }
  return (await response.json()) as Bear;
}
