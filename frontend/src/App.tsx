import React, { useEffect, useState }from 'react';
import superagent from 'superagent';

import { data as dummyData } from './utils/dummy-data';
import {
  CurrentPositiveChart,
  NumberStats,
  PercentPositiveChart,
  TestedAreaChart,
} from './components';
import { CovidDataItem } from './types';
import './App.css';

export const App: React.FunctionComponent = () => {
  const [data, setData] = useState<CovidDataItem[]>(dummyData);

  useEffect(() => {
    (async () => {
      const res = await superagent.get('https://bccovid.dav.sh/data');

      const newData = res.body.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));

      if (process.env.NODE_ENV === 'production') {
        setData(newData);
      }
    })();
  }, []);

  return (
    <div className="App">
      <h1>Boston College Covid-19 Live Statistics</h1>
      <h3>
        {'Updated: '}
        {data[data.length - 1].date.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })}
      </h3>
      <div className="row" style={{ maxWidth: '80%', margin: '0 auto' }}>
        <NumberStats data={data} />
        <CurrentPositiveChart data={data} recoveryDays={10} />
      </div>
      <TestedAreaChart data={data} />
      <PercentPositiveChart data={data} />
    </div>
  );
};
