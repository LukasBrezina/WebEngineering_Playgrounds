// Style – global constants are defined in uppercase
import type { Bear, ParsedBear } from '../models/bear.js';
import { fetchBearWikitext, fetchImageUrl } from './wikipediaClient.js';

export async function initializeBearsApi(
  signal?: AbortSignal
): Promise<Bear[]> {
  try {
    const wikitext = await fetchBearWikitext(signal);
    return await parseBears(wikitext, signal);
  } catch (error) {
    if (signal?.aborted === true) {
      throw error;
    }
    console.error('Error fetching bears API:', error);
    throw new Error('Failed to initialize bears API. Please try again later.');
  }
}

const parseBears = async (
  wikitext: string,
  signal?: AbortSignal
): Promise<Bear[]> => {
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
      image: await fetchImageUrl(fileName, signal),
    }))
  );
};

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
