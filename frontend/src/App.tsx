import React, { useEffect, useState }from 'react';
import superagent from 'superagent';

import { data as dummyData } from './utils/dummy-data';
import {
  CurrentPositiveChart,
  NumberStats,
  PercentPositiveChart,
  TestedAreaChart,
  TestedBarChart,
} from './components';
import { CovidDataItem } from './types';
import './App.css';

export const App: React.FunctionComponent = () => {
  const initialData: CovidDataItem[] = [];
  const [data, setData] = useState<CovidDataItem[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const res = await superagent.get('https://bccovid.dav.sh/data');

      const newData = res.body.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));

      if (process.env.NODE_ENV === 'production') {
        setData(newData);
        window.localStorage.setItem('data', JSON.stringify(newData));
      } else {
        setData(dummyData);
        window.localStorage.setItem('data', JSON.stringify(dummyData));
      }
      setLoading(false);
    };

    if (window.localStorage.getItem('data') !== null) {
      setData(JSON.parse(window.localStorage.getItem('data') as string).map((entry: any) => {
        const { date, ...item } = entry;
        return { ...item, date: new Date(date) };
      }));
      setLoading(false);

      setTimeout(loadData, 1000);
    } else {
      setShowLoading(true);
      loadData();
    }
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
          <div className="hint">"Total" refers to the entire BC community, including undergrad and grad students, faculty, and staff. Current positive cases are estimated with a 10 day recovery period from testing positive.</div>
          <TestedAreaChart data={data} />
          <PercentPositiveChart data={data} />
          <div className="hint">"Total" refers to the entire BC community, including undergrad and grad students, faculty, and staff.</div>
          <TestedBarChart data={data} />
          <div className="hint">"Total" refers to the entire BC community, including undergrad and grad students, faculty, and staff. "Remaining" refers to that total minus the undergraduate stats.</div>
          <p style={{ paddingBottom: 0 }}>Made by David Shen and Roger Wang.</p>
          <a href="https://bccovid.dav.sh/data">collected data</a>{' '}
          <a href="https://www.bc.edu/content/bc-web/sites/reopening-boston-college.html#testing">data source</a>{' '}
          <a href="https://github.com/pantherman594/bc-covid/">source code</a>
        </React.Fragment>
      }
      <div className="loading" style={{ opacity: loading && showLoading ? 1 : 0 }}>
        Loading...
      </div>
    </div>
  );
};
