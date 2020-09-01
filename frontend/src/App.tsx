import React, { useEffect, useState }from 'react';
import moment from 'moment';
import superagent from 'superagent';

import { data as dummyData } from './utils/dummy-data';
import {
  CurrentPositiveChart,
  NumberStats,
  PercentPositiveChart,
  PopulationPercentChart,
  TestedAreaChart,
  TestedBarChart,
  UndergradTestedAreaChart,
} from './components';
import { CovidDataItem } from './types';
import './App.css';

const processData = (data: any) => {
  const newData: CovidDataItem[] = [];

  data.map((entry: any) => ({
    ...entry,
    date: new Date(entry.date),
  })).reduceRight((deleteTo: moment.Moment, entry: any) => {
    if (entry.date > deleteTo) {
      return deleteTo;
    }

    newData.push(entry);
    return moment(entry.date).subtract(1, 'day').endOf('day');
  }, moment());

  newData.reverse();
  return newData;
};

export const App: React.FunctionComponent = () => {
  const initialData: CovidDataItem[] = [];
  const [data, setData] = useState<CovidDataItem[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const res = await superagent.get('https://bccovid.dav.sh/data');

      const newData = processData(res.body);

      if (true || process.env.NODE_ENV === 'production') {
        setData(newData);
        window.localStorage.setItem('data', JSON.stringify(newData));
      } else {
        setData(dummyData);
        window.localStorage.setItem('data', JSON.stringify(dummyData));
      }
      setLoading(false);
    };

    if (window.localStorage.getItem('data') !== null) {
      setData(processData(JSON.parse(window.localStorage.getItem('data') as string)));
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
          <h1>Boston College Covid-19 Statistics</h1>
          <h3>
            {'Updated: '}
            {data.length === 0 ? null : data[data.length - 1].date.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })}
          </h3>

          <div className="row" style={{ maxWidth: '80%', margin: '0 auto' }}>
            <NumberStats data={data} />
            <CurrentPositiveChart data={data} recoveryDays={7} />
          </div>
            <div className="hint">"Total" refers to the entire BC community, including undergrad and grad students, faculty, and staff. "Community" excludes undergrad students. Estimated populations are 80% of 2019-20 populations, as drawn from the <a href="https://www.bc.edu/content/dam/files/publications/factbook/pdf/19-20_factbook.pdf">BC factbook</a>. This is by no means accurate, but I have not been able to find any official numbers.</div>

          <div className="row">
            <div style={{ flex: 1, minWidth: 350 }}>
              <UndergradTestedAreaChart data={data} />
            </div>
            <div style={{ flex: 1, minWidth: 350 }}>
              <TestedAreaChart data={data} />
            </div>
          </div>
          <div className="hint">"Community" refers to the BC community excluding undergrad students: including grad students, faculty, and staff.</div>

          <PercentPositiveChart data={data} />
          <div className="hint">"Total" refers to the entire BC community, including undergrad and grad students, faculty, and staff.</div>

          <TestedBarChart data={data} />
          <div className="hint">"Total" refers to the entire BC community, including undergrad and grad students, faculty, and staff. "Remaining" refers to that total minus the undergraduate stats.</div>

          <PopulationPercentChart data={data} recoveryDays={7} />
          <div className="hint">This graph shows the number of positive tests in the past 7 days, as a percentage of the total population of the respective community. Take these values with a huge grain of salt. Many assumptions were made about population sizes.</div>

          <p style={{ paddingBottom: 0 }}>Made by David Shen and Roger Wang.</p>

          <a href="https://bccovid.dav.sh/data">collected data</a>{' '}

          <br />

          <a href="https://www.bc.edu/content/bc-web/sites/reopening-boston-college.html#testing">bc data</a>
          <br />

          <a href="https://www.bu.edu/healthway/community-dashboard/">bu data</a>{' '}
          <a href="https://news.northeastern.edu/coronavirus/reopening/testing-dashboard/">neu data</a>{' '}
          <a href="https://docs.google.com/spreadsheets/u/0/d/1C8PDCqHB9DbUYbvrEMN2ZKyeDGAMAxdcNkmO2QSZJsE/pubhtml">neu direct</a>{' '}
          <a href="https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/">county data</a>{' '}
          <a href="https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv">county direct</a>

          <br />

          <a href="https://github.com/pantherman594/bc-covid/">source code</a>
        </React.Fragment>
      }
      <div className="loading" style={{ opacity: loading && showLoading ? 1 : 0 }}>
        Loading...
      </div>
    </div>
  );
};
