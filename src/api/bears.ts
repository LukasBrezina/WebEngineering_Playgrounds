// Style – global constants are defined in uppercase
import type { Bear, ParsedBear } from '../models/bear.js';
import type {
  ImageInfoResponse,
  WikipediaParams,
  WikitextResponse,
} from '../models/wikipedia.js';

const BASE_URL = 'https://en.wikipedia.org/w/api.php';
const FALLBACK_IMAGE = './media/noImageFound.jpg';
// Magic number – extracted to a constant for clarity and maintainability
const WIKIPEDIA_SECTION_INDEX = 3;

export async function initializeBearsApi(): Promise<Bear[]> {
  try {
    const wikitext = await fetchBearWikitext();
    return await parseBears(wikitext);
  } catch (error) {
    console.error('Error fetching bears API:', error);
    throw new Error('Failed to initialize bears API. Please try again later.');
  }
}

// Style – unclear function name
async function fetchBearWikitext(): Promise<string> {
  const data = await fetchWikipediaApi({
    action: 'parse',
    page: 'List_of_ursids',
    prop: 'wikitext',
    section: WIKIPEDIA_SECTION_INDEX,
    format: 'json',
    origin: '*',
  });

  if (!isWikitextResponse(data)) {
    throw new Error('Invalid Wikipedia API response');
  }

  const wikitext = data.parse?.wikitext?.['*'];
  if (wikitext === undefined) {
    throw new Error('Failed to fetch wikitext from Wikipedia API');
  }
  return wikitext;
}

// Single Responsibility – Only parsing, nothing else
function parseBear(bear: string): ParsedBear | null {
  const name = bear.match(/\|name=\[\[(.*?)\]\]/)?.[1];
  const binomial = bear.match(/\|binomial=(.*?)\n/)?.[1];
  const image = bear.match(/\|image=(.*?)\n/)?.[1];
  const range = bear.match(/\|range=([^|]+)/)?.[1];

  if (name == null || binomial == null || image == null || range == null) {
    return null; // return null if any of the required fields are missing
  }

  return {
    name,
    binomial,
    fileName: image.trim().replace('File:', ''),
    range: range.trim(),
  };
}

const parseBears = async (wikitext: string): Promise<Bear[]> => {
  const speciesTables = wikitext.split('{{Species table/end}}');

  // flatten array to single list and parse bears
  const parsedRows = speciesTables
    .flatMap((table) => table.split('{{Species table/row'))
    .map(parseBear)
    .filter((bear): bear is ParsedBear => bear !== null); // remove all falsy values from array (here 'null' which may be returned from parseBear)

  // each fetchImageUrl request is awaited concurrently (Promise.all)
  // try & catch is unnecessary, as fetchImageUrl handles errors and returns a fallback image
  return await Promise.all(
    parsedRows.map(async ({ name, binomial, fileName, range }) => ({
      name,
      binomial,
      range,
      image: await fetchImageUrl(fileName),
    }))
  );
};

async function fetchImageUrl(fileName: string): Promise<string> {
  try {
    const data = await fetchWikipediaApi({
      action: 'query',
      titles: 'File:' + fileName,
      prop: 'imageinfo',
      iiprop: 'url',
      format: 'json',
      origin: '*',
    });

    if (!isImageInfoResponse(data)) {
      return FALLBACK_IMAGE;
    }

    const pages = data.query?.pages;
    if (pages === undefined) return FALLBACK_IMAGE;

    const page = Object.values(pages)[0];
    return page?.imageinfo?.[0]?.url ?? FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error fetching image URL:', error);
    return FALLBACK_IMAGE;
  }
}

// Single Responsibility – Only fetching, nothing else
// Duplicated Code – extracted fetching from fetchingBearWikitext and fetchImageUrl
async function fetchWikipediaApi(params: WikipediaParams): Promise<unknown> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  const response = await fetch(BASE_URL + '?' + query);

  if (!response.ok) {
    throw new Error(
      `Wikipedia API request failed with status ${response.status}`
    );
  }

  return await response.json();
}

// Helper Methods for validating the response types from Wikipedia API
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWikitextResponse(data: unknown): data is WikitextResponse {
  if (!isRecord(data) || !isRecord(data.parse)) return false;
  if (!isRecord(data.parse.wikitext)) return false;
  return typeof data.parse.wikitext['*'] === 'string';
}

function isImageInfoResponse(data: unknown): data is ImageInfoResponse {
  if (!isRecord(data) || !isRecord(data.query)) return false;
  return isRecord(data.query.pages);
}
