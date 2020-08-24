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
  const initialData: CovidDataItem[] = [];
  const [data, setData] = useState<CovidDataItem[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await superagent.get('https://bccovid.dav.sh/data');

      const newData = res.body.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));

      if (process.env.NODE_ENV === 'production') {
        setData(newData);
      } else {
        setData(dummyData);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="App" style={{ overflowY: loading ? 'hidden' : 'auto' }}>
      { loading ? null :
        <React.Fragment>
          <h1>Boston College Covid-19 Live Statistics</h1>
          <h3>
            {'Updated: '}
            {data.length === 0 ? null : data[data.length - 1].date.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })}
          </h3>
          <div className="row" style={{ maxWidth: '80%', margin: '0 auto' }}>
            <NumberStats data={data} />
            <CurrentPositiveChart data={data} recoveryDays={10} />
          </div>
          <TestedAreaChart data={data} />
          <PercentPositiveChart data={data} />
          <p style={{ paddingBottom: 0 }}>Made by David Shen and Roger Wang.</p>
          <a href="https://bccovid.dav.sh/data">collected data</a>{' '}
          <a href="https://www.bc.edu/content/bc-web/sites/reopening-boston-college.html#testing">data source</a>{' '}
          <a href="https://github.com/pantherman594/bc-covid/">source code</a>
        </React.Fragment>
      }
      <div className="loading" style={{ opacity: loading ? 1 : 0 }}>
        Loading...
      </div>
    </div>
  );
};
