import React, { useEffect, useState } from 'react';
import moment from 'moment';
import superagent from 'superagent';

import './App.css';
import {
  NumberStats,
  DialChart,

  CumulativePositiveChart,
  CumulativeTestedChart,

  DailyPositiveChart,
  PercentPositiveChart,

  PopulationPercentChart,

  TestedBarChart,
} from './components';
import { CovidDataItem } from './types';

const DATA_VERSION = '1';

const processData = (data: any) => {
  const newData: CovidDataItem[] = [];

  if (data.length === 0) return newData;

  const firstDay = moment(new Date(data[0].date)).endOf('day');

  data.map((entry: any) => ({
    ...entry,
    date: new Date(entry.date),
  })).reduceRight((deleteTo: moment.Moment, entry: any) => {
    if (entry.date > deleteTo) {
      return deleteTo;
    }

    const newDate = moment(entry.date).endOf('day');

    const newEntry = {
      ...entry,
      date: newDate.toDate(),
    };

    newData.push(newEntry);
    return newDate.subtract(1, 'day');
  }, moment());

  newData.reverse();

  // Maps days since first day to index in data array.
  const daysSinceFirst = new Map<number, number>();

  // Populates the map.
  for (let i = 0; i < newData.length; i += 1) {
    const diff = moment(newData[i].date).diff(firstDay, 'days');
    daysSinceFirst.set(diff, i);
    newData[i].daysSinceFirst = diff;
  }

  for (let i = 0; i < newData.length; i += 1) {
    let recoveryDaysSinceFirst = (newData[i].daysSinceFirst || 0) - 7;

    while (!daysSinceFirst.has(recoveryDaysSinceFirst) && recoveryDaysSinceFirst > -1) {
      recoveryDaysSinceFirst -= 1;
    }

    let recoveryIndex = daysSinceFirst.get(recoveryDaysSinceFirst);
    if (recoveryIndex === undefined) recoveryIndex = -1;

    newData[i].recoveryIndex = recoveryIndex;
  }

  return newData;
};

const checkIsEmbed = () => {
  const { search } = window.location;
  const params = new URLSearchParams(search);
  return params.get('embed') === 'true';
};

const App: React.FunctionComponent = () => {
  const initialData: CovidDataItem[] = [];
  const [data, setData] = useState<CovidDataItem[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [adjustSep3, setAdjustSep3] = useState(false);
  const [logScale, setLogScale] = useState(false);
  const [isEmbed] = useState(checkIsEmbed());

  useEffect(() => {
    const loadData = async () => {
      const res = await superagent.get('https://bccovid.dav.sh/data');

      const newData = processData(res.body);

      setData(newData);
      window.localStorage.setItem('data', JSON.stringify(res.body));
      window.localStorage.setItem('dataVersion', DATA_VERSION);
      setLoading(false);
    };

    if (window.localStorage.getItem('data') !== null && window.localStorage.getItem('dataVersion') === DATA_VERSION) {
      setData(processData(JSON.parse(window.localStorage.getItem('data') as string)));
      setLoading(false);

      setTimeout(loadData, 1000);
    } else {
      setShowLoading(true);
      loadData();
    }
  }, []);

  const scale = logScale ? 'log' : 'linear';

  return (
    <div className={`App${isEmbed ? ' embed' : ''}`} style={{ overflowY: loading ? 'hidden' : 'auto' }}>
      { loading ? null
        : (
          <>
            <h1>Boston College Covid-19 Statistics</h1>
            <h3>
              {'Updated: '}
              {data.length === 0 ? null : data[data.length - 1].date.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={() => setLogScale(!logScale)}
            >
              {logScale ? 'Use linear scale' : 'Use log scale'}
            </button>

            <div className="row" style={{ maxWidth: 1200, width: '80%', margin: '0 auto' }}>
              <NumberStats data={data} />
              <DialChart data={data} recoveryDays={7} />
            </div>
            <div className="hint">
              &ldquo;Total&rdquo; refers to the entire BC community, including undergrad and
              grad students, faculty, and staff. &ldquo;Community&rdquo; excludes undergrad
              students.
            </div>

            <div className="row">
              <div style={{ flex: 1, minWidth: 350 }}>
                <CumulativePositiveChart data={data} scale={scale} />
              </div>
              <div style={{ flex: 1, minWidth: 350 }}>
                <CumulativeTestedChart data={data} scale={scale} />
              </div>
            </div>
            <div className="hint">
              &ldquo;Total&rdquo; refers to the entire BC community, including undergrad
              and grad students, faculty, and staff. &ldquo;Community&rdquo; excludes
              undergrad students.
            </div>

            <div className="row">
              <div style={{ flex: 1, minWidth: 350 }}>
                <DailyPositiveChart data={data} scale={scale} />
              </div>
              <div style={{ flex: 1, minWidth: 350 }}>
                <PercentPositiveChart data={data} />
              </div>
            </div>
            <div className="hint">
              &ldquo;Total&rdquo; refers to the entire BC community, including undergrad
              and grad students, faculty, and staff. &ldquo;Community&rdquo; excludes
              undergrad students.
            </div>

            <TestedBarChart data={data} scale={scale} />

            <PopulationPercentChart data={data} />
            <div className="hint">
              This graph shows the number of positive tests in the past 7 days, as a
              percentage of the total population of the respective community. Take these
              values with a huge grain of salt. Many assumptions were made about population
              sizes.
            </div>

            <hr />

            <div className="note">
              * On 9/3, BC shifted their reporting from the number of undergrads who tested
              positive to the number of undergrad tests that came back positive, counting
              tests instead of people. I did not adjust the data prior to 9/3 because that
              could only be a guess, but I suspect a good number of undergraduate tests
              were counted as community tests. Picture shifting the &ldquo;Tests and Results
              per Day&rdquo; graph below up a bit to better fit the data after 9/3.
              <br />
              <br />
              The button below adjusts the data prior to 9/3 by moving 30% of the community
              tests to the undergraduates. There is no reasoning to this 30% other than the
              fact that it makes the cumulative graphs non-decreasing, as one would expect
              them to be.
            </div>
            { adjustSep3 ? (
              <div className="note">Refresh the page to reset the data.</div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustSep3(true);
                    setData((oldData: CovidDataItem[]) => oldData.map((entry: CovidDataItem) => {
                      if (entry.date < new Date('2020-09-04')) {
                        const { undergradTested, totalTested, ...rest } = entry;
                        return {
                          ...rest,
                          totalTested,
                          undergradTested: Math.round(
                            undergradTested + (totalTested - undergradTested) * 0.3,
                          ),
                        };
                      }

                      return entry;
                    }));
                  }}
                >
                  Simulate
                </button>
              </>
            )}

            <hr />

            <p style={{ paddingBottom: 0 }}>Made by David Shen and Roger Wang.</p>

            <a href="https://bccovid.dav.sh/data">collected data</a>
            {' '}

            <br />

            <a href="https://www.bc.edu/content/bc-web/sites/reopening-boston-college.html#testing">bc data</a>
            <br />

            <a href="https://www.bu.edu/healthway/community-dashboard/">bu data</a>
            {' '}
            <a href="https://news.northeastern.edu/coronavirus/reopening/testing-dashboard/">neu data</a>
            {' '}
            <a href="https://docs.google.com/spreadsheets/u/0/d/1C8PDCqHB9DbUYbvrEMN2ZKyeDGAMAxdcNkmO2QSZJsE/pubhtml">neu direct</a>
            {' '}
            <a href="https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/">county data</a>
            {' '}
            <a href="https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv">county direct</a>

            <br />

            <a href="https://github.com/pantherman594/bc-covid/">source code</a>
            {' '}
            <a href="https://bccovid.dav.sh/changelog">changelog</a>
          </>
        )}
      <div className="loading" style={{ opacity: loading && showLoading ? 1 : 0 }}>
        Loading...
      </div>
      { !isEmbed ? null : <style>{'body{overflow-y:hidden;}'}</style> }
    </div>
  );
};

export default App;
