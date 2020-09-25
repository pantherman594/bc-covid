export interface CovidDataItem {
  [key: string]: any;
  id: string;
  date: Date;
  totalTested: number;
  totalPositive: number;
  totalRecovered: number;
  undergradTested: number;
  undergradPositive: number;
  undergradRecovered: number;
  isolation: number;
  buPositive: number;
  neuPositive: number;
  suffolkPositive: number;
  massPositive: number;
  flags: string[];
  recoveryIndex: number;
  daysSinceFirst: number;
}

export const create = (): CovidDataItem => ({
  id: '',
  date: new Date(),
  totalTested: 0,
  totalPositive: 0,
  totalRecovered: 0,
  undergradTested: 0,
  undergradPositive: 0,
  undergradRecovered: 0,
  isolation: 0,
  buPositive: 0,
  neuPositive: 0,
  suffolkPositive: 0,
  massPositive: 0,
  flags: [],
  recoveryIndex: 0,
  daysSinceFirst: 0,
});
