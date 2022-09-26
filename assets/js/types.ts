export interface Page {
  title: string; // == eva_number
  country: string;
  crew: string;
  vehicle: string;
  param_date: string;
  duration: string;
  purpose: string;
  url: string;
}

interface Match {
  key: string;
  value: string;
  indices: number[][];
}

export interface Hit {
  item: Page;
  refIndex: number;
  matches: Match[];
}
