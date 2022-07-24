export interface Page {
  title: string;
  latin_name: string;
  family_name: string;
  plant_type: string;
  bloom_time: string;
  flower_color: string;
  size_at_maturity: string;
  water_needs: string;
  additional_characteristices_notes: string;
  url: string;
}

export interface Hit {
  item: Page;
  refIndex: number;
}
