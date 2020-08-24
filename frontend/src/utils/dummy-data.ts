import { CovidDataItem } from '../types';

export const data: CovidDataItem[] = [
  {
    id: '1',
    date: new Date(2020, 7, 23),
    totalTested: 6997,
    totalPositive: 2,
    undergradTested: 1102,
    undergradPositive: 0,
    isolation: 0,
    flags: [],
  },
  {
    id: '2',
    date: new Date(2020, 7, 24),
    totalTested: 7123,
    totalPositive: 3,
    undergradTested: 1212,
    undergradPositive: 1,
    isolation: 1,
    flags: [],
  },
  {
    id: '3',
    date: new Date(2020, 7, 25),
    totalTested: 7347,
    totalPositive: 4,
    undergradTested: 1392,
    undergradPositive: 2,
    isolation: 2,
    flags: [],
  },
  {
    id: '4',
    date: new Date(2020, 7, 26),
    totalTested: 7723,
    totalPositive: 6,
    undergradTested: 1456,
    undergradPositive: 4,
    isolation: 4,
    flags: [],
  },
  {
    id: '5',
    date: new Date(2020, 7, 27),
    totalTested: 8352,
    totalPositive: 8,
    undergradTested: 1512,
    undergradPositive: 7,
    isolation: 6,
    flags: [],
  },
];