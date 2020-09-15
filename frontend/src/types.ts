export interface CovidDataItem {
  [key: string]: any;
  id: string;
  date: Date;
  totalTested: number;
  totalPositive: number;
  undergradTested: number;
  undergradPositive: number;
  isolation: number;
  recovered: number;
  buPositive: number;
  neuPositive: number;
  suffolkPositive: number;
  massPositive: number;
  flags: string[];
}

export const create = (): CovidDataItem => ({
  id: '',
  date: new Date(),
  totalTested: 0,
  totalPositive: 0,
  undergradTested: 0,
  undergradPositive: 0,
  isolation: 0,
  recovered: 0,
  buPositive: 0,
  neuPositive: 0,
  suffolkPositive: 0,
  massPositive: 0,
  flags: [],
});
