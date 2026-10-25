export interface Bear {
  id: string;
  name: string;
  binomial: string;
  range: string;
  image: string;
}

// takes everything from Bear except for the image property and adds a fileName property
export type ParsedBear = Omit<Bear, 'image' | 'id'> & { fileName: string };
