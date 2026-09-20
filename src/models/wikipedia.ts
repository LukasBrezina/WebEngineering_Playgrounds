export type WikipediaParams = Record<string, string | number>;

export interface WikitextResponse {
    parse?: { wikitext?: { "*"?: string } };
}

export interface ImageInfoResponse {
    query?: { pages?: Record<string, { imageinfo?: { url?: string }[] }> };
}