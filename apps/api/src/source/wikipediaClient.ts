import { z } from 'zod';
import { UpstreamError, UpstreamTimeoutError } from '../errors/errors.js';
import { config } from '../config.js';

const BASE_URL = config.WIKIPEDIA_API_URL;
const USER_AGENT =
  'WebEngineeringPlaygrounds/0.1 (https://github.com/LukasBrezina/WebEngineering_Playgrounds; educational course project, low traffic)';
const TIMEOUT_MS = 5000;
const FALLBACK_IMAGE = '/media/noImageFound.jpg';
// Magic number – extracted to a constant for clarity and maintainability
const WIKIPEDIA_SECTION_INDEX = 3;

type WikipediaParams = Record<string, string | number>;

const WikitextResponse = z.object({
  parse: z.object({ wikitext: z.object({ '*': z.string() }) }),
});

const ImageInfoResponse = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({ imageinfo: z.array(z.object({ url: z.string() })).optional() })
    ),
  }),
});

export async function fetchBearWikitext(): Promise<string> {
  const data = await fetchWikipediaApi(
    {
      action: 'parse',
      page: 'List_of_ursids',
      prop: 'wikitext',
      section: WIKIPEDIA_SECTION_INDEX,
    },
    WikitextResponse
  );
  return data.parse.wikitext['*'];
}

export async function fetchImageUrl(fileName: string): Promise<string> {
  try {
    const data = await fetchWikipediaApi(
      {
        action: 'query',
        titles: 'File:' + fileName,
        prop: 'imageinfo',
        iiprop: 'url',
      },
      ImageInfoResponse
    );
    const page = Object.values(data.query.pages)[0];
    return page?.imageinfo?.[0]?.url ?? FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error fetching image URL:', error);
    return FALLBACK_IMAGE;
  }
}

// Single Responsibility – Only fetching (and validating the envelope), nothing else
async function fetchWikipediaApi<S extends z.ZodType>(
  params: WikipediaParams,
  schema: S
): Promise<z.infer<S>> {
  const query = new URLSearchParams(
    Object.entries({ ...params, format: 'json' }).map(([key, value]) => [
      key,
      String(value),
    ])
  ).toString();

  let response: Response;
  try {
    response = await fetch(BASE_URL + '?' + query, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw (error as Error).name === 'TimeoutError'
      ? new UpstreamTimeoutError()
      : new UpstreamError('Wikipedia API unreachable');
  }

  if (!response.ok) {
    throw new UpstreamError(
      `Wikipedia API request failed with status ${response.status}`
    );
  }

  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    throw new UpstreamError('Unexpected Wikipedia API response');
  }
  return parsed.data;
}
