// Helper Methods for validating the response types from Wikipedia API
import {
  type ImageInfoResponse,
  type WikitextResponse,
} from '../models/wikipedia.js';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isWikitextResponse(data: unknown): data is WikitextResponse {
  if (!isRecord(data) || !isRecord(data.parse)) return false;
  if (!isRecord(data.parse.wikitext)) return false;
  return typeof data.parse.wikitext['*'] === 'string';
}

export function isImageInfoResponse(data: unknown): data is ImageInfoResponse {
  if (!isRecord(data) || !isRecord(data.query)) return false;
  return isRecord(data.query.pages);
}
