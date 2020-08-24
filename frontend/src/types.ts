export interface CovidDataItem {
  [key: string]: any;
  id: string;
  date: Date;
  totalTested: number;
  totalPositive: number;
  undergradTested: number;
  undergradPositive: number;
  isolation: number;
  flags: string[];
}
