import { type Bear, BearsSchema, type ParsedBear } from './models/bear.js';
import { fetchBearWikitext, fetchImageUrl } from './wikipediaClient.js';
import { UpstreamError } from './errors.js';
import { asc, eq } from 'drizzle-orm';
import { db } from './db.js';
import { bears } from './db/schema.js';

export async function fetchBearsFromWikipedia(): Promise<Bear[]> {
  const bears = await parseBears(await fetchBearWikitext());
  const result = BearsSchema.safeParse(bears);
  if (!result.success) {
    throw new UpstreamError('Wikipedia data failed validation');
  }
  return result.data;
}

const parseBears = async (wikitext: string): Promise<Bear[]> => {
  const speciesTables = wikitext.split('{{Species table/end}}');

  // flatten array to single list and parse bears
  const parsedRows = speciesTables
    .flatMap((table) => table.split('{{Species table/row'))
    .map(parseBear)
    .filter((bear): bear is ParsedBear => bear !== null);

  // each fetchImageUrl request is awaited concurrently (Promise.all)
  // try & catch is unnecessary, as fetchImageUrl handles errors and returns a fallback image
  return await Promise.all(
    parsedRows.map(async ({ name, binomial, fileName, range }) => ({
      id: formatStringToId(binomial),
      name,
      binomial,
      range,
      imageUrl: await fetchImageUrl(fileName),
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

const formatStringToId = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const bearColumns = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  imageUrl: bears.imageUrl,
  range: bears.range,
};

export async function listBears(): Promise<Bear[]> {
  return await db.select(bearColumns).from(bears).orderBy(asc(bears.name));
}

export async function findBear(id: string): Promise<Bear | undefined> {
  const [bear] = await db
    .select(bearColumns)
    .from(bears)
    .where(eq(bears.id, id))
    .limit(1);
  return bear;
}
