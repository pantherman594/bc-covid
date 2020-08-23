export interface PlotDataItem {
  [key: string]: any;
  x: number;
  y: number;
}

export interface CovidDataItem {
  [key: string]: any;
  id: string;
  date: Date;
  totalTested: number;
  totalPositives: number;
  undergradTested: number;
  undergradPositive: number;
  isolation: number;
  flags: string[];
}
