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

export interface Hit {
  item: Page;
  refIndex: number;
}
