import React, { useCallback, useEffect, useState } from 'react';
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
import { CovidDataItem, create } from './types';

const DATA_VERSION = '2';

const processData = (showFall: boolean, data: any) => {
  const newData: CovidDataItem[] = [];
  let filteredData: any[] = data;
  let lastInFall = create();

  if (!showFall) {
    filteredData = data.filter((entry: any) => (
      new Date(entry.date).getFullYear() >= 2021
    ));
    lastInFall = data[data.length - filteredData.length - 1] ?? lastInFall;
  }

  if (filteredData.length === 0) return newData;

  const firstDay = moment(new Date(filteredData[0].date)).endOf('day');

  filteredData.map((entry: any) => ({
    ...entry,
    date: new Date(entry.date),
  })).reduceRight((deleteTo: moment.Moment, entry: any) => {
    if (entry.date > deleteTo) {
      return deleteTo;
    }

    const newDate = moment(entry.date).endOf('day');

    const newEntry = {
      ...entry,
      totalTested: entry.totalTested - lastInFall.totalTested,
      totalPositive: entry.totalPositive - lastInFall.totalPositive,
      totalRecovered: entry.totalRecovered - lastInFall.totalRecovered,
      undergradTested: entry.undergradTested - lastInFall.undergradTested,
      undergradPositive: entry.undergradPositive - lastInFall.undergradPositive,
      undergradRecovered: entry.undergradRecovered - lastInFall.undergradRecovered,
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

const loadData = async (showFall: boolean, setData: Function, setLoading: Function) => {
  const res = await superagent.get('https://bccovid.dav.sh/data');

  const newData = processData(showFall, res.body);

  setData(newData);
  window.localStorage.setItem('data', JSON.stringify(res.body));
  window.localStorage.setItem('dataVersion', DATA_VERSION);
  window.localStorage.setItem('showFall', showFall ? 'true' : 'false');
  setLoading(false);
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
  const [showFall, setShowFall] = useState(false);
  const [isEmbed] = useState(checkIsEmbed());

  useEffect(() => {
    if (window.localStorage.getItem('data') !== null && window.localStorage.getItem('dataVersion') === DATA_VERSION) {
      const showFallLS = window.localStorage.getItem('showFall') !== 'false';
      setShowFall(showFallLS);
      setData(processData(showFallLS, JSON.parse(window.localStorage.getItem('data') as string)));
      setLoading(false);

      setTimeout(() => loadData(showFallLS, setData, setLoading), 1000);
    } else {
      setShowLoading(true);
      loadData(/* showFall */true, setData, setLoading);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    loadData(showFall, setData, setLoading);
  }, [loading, showFall]);

  const resize = useCallback(() => {
    const frame = document.getElementById('ai_hidden_iframe_advanced_iframe') as HTMLIFrameElement;
    if (!frame) return;

    const url = `${(window as any).domain_advanced_iframe}/js/iframe_height.html`;
    if (!document.getElementById('ai_wrapper_div')) {
      (window as any).createAiWrapperDiv();
    }
    const wrapper = document.body.children[0] as HTMLDivElement;
    wrapper.style.marginTop = '0';
    wrapper.style.marginBottom = '0';
    const iframeHeight = wrapper.offsetHeight;
    const iframeWidth = (window as any).getIframeWidth();
    frame.src = `${url}?height=${iframeHeight + 4}&width=${iframeWidth}&id=${(window as any).iframe_id_advanced_iframe}`;
  }, []);

  useEffect(() => {
    if (!isEmbed) return;
    resize();
  }, [isEmbed, loading, data, resize]);

  useEffect(() => {
    if (!isEmbed) return () => {};

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isEmbed, resize]);

  const scale = logScale ? 'log' : 'linear';

  return (
    <div className={`App${isEmbed ? ' embed' : ''}`} style={{ overflowY: loading ? 'hidden' : 'auto' }}>
      { loading ? null
        : (
          <>
            <h1>
              { isEmbed ? 'Coronavirus Statistics' : 'Boston College Covid-19 Statistics' }
            </h1>
            <h3>
              {'Updated '}
              {data.length === 0 ? null : moment(data[data.length - 1].date).format('MMMM D, Y')}
            </h3>
            <button
              type="button"
              onClick={() => setLogScale(!logScale)}
              style={{ margin: 10 }}
            >
              {logScale ? 'Use linear scale' : 'Use log scale'}
            </button>
            <button
              type="button"
              onClick={() => setShowFall(!showFall)}
              style={{ margin: 10 }}
            >
              {showFall ? 'Exclude fall data' : 'Include fall data'}
            </button>

            <div className="row" style={{ maxWidth: 1200, width: isEmbed ? undefined : '80%', margin: '0 auto' }}>
              <NumberStats data={data} />
              <DialChart data={data} recoveryDays={7} />
            </div>
            <div className="hint">
              &ldquo;Total&rdquo; refers to the entire BC community, including undergrad and
              grad students, faculty, and staff.
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
              and grad students, faculty, and staff.
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
              and grad students, faculty, and staff.
            </div>

            <TestedBarChart data={data} scale={scale} />

            <PopulationPercentChart data={data} />
            <div className="hint">
              This graph shows the number of positive tests in the past 7 days,
              as a percentage of the estimated total population of the respective community.
              Part of BC&rsquo;s campus lies in Middlesex County and part lies in Suffolk County.
            </div>

            <hr />

            { showFall ? (
              <>
                <div className="note">
                  * On 9/3, BC shifted their reporting from the number of undergrads who tested
                  positive to the number of undergrad tests that came back positive, counting
                  tests instead of people. We did not adjust the data prior to 9/3 because that
                  could only be a guess, but we suspect a good number of undergraduate tests
                  were counted as non-undergraduate tests. Picture shifting the &ldquo;Tests
                  and Results per Day&rdquo; graph below up a bit to better fit the data after
                  9/3.
                  <br />
                  <br />
                  The button below adjusts the data prior to 9/3 by moving 30% of the
                  non-undergraduate tests to the undergraduates. There is no reasoning to this
                  30% other than the fact that it makes the cumulative graphs non-decreasing,
                  as one would expect them to be.
                </div>
                { adjustSep3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustSep3(false);
                      loadData(showFall, setData, setLoading);
                    }}
                  >
                    Revert
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustSep3(true);
                        setData((oldData) => oldData.map((entry: CovidDataItem) => {
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
              </>
            ) : null}

            {isEmbed ? null
              : <p style={{ paddingBottom: 0 }}>Made by David Shen and Roger Wang.</p>}

            <a href="https://bccovid.dav.sh/data">Collected Data Sources</a>
            {' '}
            <br />
            <a href="https://www.bc.edu/content/bc-web/sites/reopening-boston-college.html#testing">BC Data</a>
            <br />
            <a href="https://www.bu.edu/healthway/community-dashboard/">BU Data</a>
            {' '}
            <a href="https://news.northeastern.edu/coronavirus/reopening/testing-dashboard/">NEU Data</a>
            {' '}
            <a href="https://docs.google.com/spreadsheets/u/0/d/1C8PDCqHB9DbUYbvrEMN2ZKyeDGAMAxdcNkmO2QSZJsE/pubhtml">NEU Direct</a>
            {' '}
            <a href="https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/">County Data</a>
            {' '}
            <a href="https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv">County Direct</a>

            <br />

            <a href="https://github.com/pantherman594/bc-covid/">Source Code</a>
            {' '}
            <a href="https://bccovid.dav.sh/changelog">Changelog</a>
          </>
        )}
      <div className="loading" style={{ opacity: loading && showLoading ? 1 : 0 }}>
        Loading...
      </div>

      <div style={{
        width: 0,
        height: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'absolute',
        opacity: 0,
      }}>
        <svg>
          <defs>
            <linearGradient id="colorUndergrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorCommunity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#009dff" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#009dff" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5f6d7d" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#5f6d7d" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default App;
