import type { WikipediaParams } from '../models/wikipedia.js';
import { isImageInfoResponse, isWikitextResponse } from '../utils/dataUtils.js';

const BASE_URL = 'https://en.wikipedia.org/w/api.php';
const FALLBACK_IMAGE = './media/noImageFound.jpg';
// Magic number – extracted to a constant for clarity and maintainability
const WIKIPEDIA_SECTION_INDEX = 3;

// Style – unclear function name
export async function fetchBearWikitext(signal?: AbortSignal): Promise<string> {
  const data = await fetchWikipediaApi(
    {
      action: 'parse',
      page: 'List_of_ursids',
      prop: 'wikitext',
      section: WIKIPEDIA_SECTION_INDEX,
      format: 'json',
      origin: '*',
    },
    signal
  );

  if (!isWikitextResponse(data)) {
    throw new Error('Invalid Wikipedia API response');
  }

  const wikitext = data.parse?.wikitext?.['*'];
  if (wikitext === undefined) {
    throw new Error('Failed to fetch wikitext from Wikipedia API');
  }
  return wikitext;
}
export async function fetchImageUrl(
  fileName: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    const data = await fetchWikipediaApi(
      {
        action: 'query',
        titles: 'File:' + fileName,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
        origin: '*',
      },
      signal
    );

    if (!isImageInfoResponse(data)) {
      return FALLBACK_IMAGE;
    }

    const pages = data.query?.pages;
    if (pages === undefined) return FALLBACK_IMAGE;

    const page = Object.values(pages)[0];
    return page?.imageinfo?.[0]?.url ?? FALLBACK_IMAGE;
  } catch (error) {
    if (signal?.aborted === true) {
      throw error;
    }
    console.error('Error fetching image URL:', error);
    return FALLBACK_IMAGE;
  }
}

// Single Responsibility – Only fetching, nothing else
// Duplicated Code – extracted fetching from fetchingBearWikitext and fetchImageUrl
async function fetchWikipediaApi(
  params: WikipediaParams,
  signal?: AbortSignal
): Promise<unknown> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  const response = await fetch(BASE_URL + '?' + query, { signal });

  if (!response.ok) {
    throw new Error(
      `Wikipedia API request failed with status ${response.status}`
    );
  }

  return await response.json();
}
