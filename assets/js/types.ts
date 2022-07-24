export interface Page {
  title: string;
  url: string;
}

export interface Hit {
  item: Page;
  refIndex: number;
}