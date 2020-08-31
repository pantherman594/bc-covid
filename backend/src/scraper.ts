import cheerio from 'cheerio';
import * as csv from 'fast-csv';
import superagent from 'superagent';

import connectDB from './lib/db';
import error from './lib/error';
import DataModel from './models/Data';

const DATA_URL = 'https://www.bc.edu/content/bc-web/sites/reopening-boston-college.html';

// From
// https://app.powerbi.com/view?r=eyJrIjoiMzI4OTBlMzgtODg5MC00OGEwLThlMDItNGJiNDdjMDU5ODhkIiwidCI6ImQ1N2QzMmNjLWMxMjEtNDg4Zi1iMDdiLWRmZTcwNTY4MGM3MSIsImMiOjN9,
// and https://www.bu.edu/healthway/community-dashboard/.
const BU_URL = 'https://wabi-us-north-central-api.analysis.windows.net/public/reports/querydata?synchronous=true';

// From https://news.northeastern.edu/coronavirus/reopening/testing-dashboard/.
const NEU_URL = 'https://spreadsheets.google.com/feeds/cells/1C8PDCqHB9DbUYbvrEMN2ZKyeDGAMAxdcNkmO2QSZJsE/1/public/full?alt=json';

// From https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/.
const MASS_COUNTY_CASES_DL = 'https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv';
const SUFFOLK_FIPS = '25025';

const IGNORE_KEYS = [
  '_id',
  '__v',
  'flags',
  'date',
];

const EXPECTED_LABELS = [
  'BC Community tests performed',
  'Total Positives',
  'Undergrads Tested',
  'Undergrads Testing Positive',
];

const EXPECTED_ISOLATION_LABEL = 'Undergrads Currently in Isolation';

interface IBCData {
  totalTested: number;
  totalPositive: number;
  undergradTested: number;
  undergradPositive: number;
  isolation: number;
}

interface IBUData {
  buPositive: number;
}

interface INEUData {
  neuPositive: number;
}

interface IMassData {
  suffolkPositive: number;
  massPositive: number;
}

const scrapeBC = async (): Promise<IBCData> => {
  console.log('Scraping BC...');

  // Attempt to load the webpage.
  const res = await superagent.get(DATA_URL);
  if (res.status !== 200) {
    throw new Error(`Request failed with error code ${res.status}.`);
  }

  const $ = cheerio.load(res.text);

  // Extract the grid of data items from the page.
  const dataBoxes = $('.fact-gray-new > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)');

  // Ensure that we found the grid.
  if (dataBoxes.length !== 1) {
    throw new Error('Did not find the data boxes.');
  }

  const fields = dataBoxes.find('.figure');
  const labels = dataBoxes.find('.fact');

  // Ensure we have the expected labels and fields.
  if (fields.length !== EXPECTED_LABELS.length || labels.length !== EXPECTED_LABELS.length) {
    throw new Error('Did not find the correct number of data fields.');
  }

  const failedLabels: string[] = [];
  labels.each(function f(this: Cheerio, i: number, _elem: any) {
    if ($(this).text().trim() !== EXPECTED_LABELS[i]) {
      failedLabels.push(EXPECTED_LABELS[i]);
    }
  });

  if (failedLabels.length > 0) {
    throw new Error(`Labels have changed, please fix scraper. Failed labels: ${failedLabels.join(', ')}.`);
  }

  const data: number[] = [];

  // Convert the fields into numbers, stripping commas, and add to the data array.
  fields.each(function f(this: Cheerio, _i: number, _elem: any) {
    const value = parseInt($(this).text().replace(/,/g, ''), 10);

    if (Number.isNaN(value)) {
      throw new Error('Parse int failed.');
    }

    data.push(value);
  });

  if (data.length !== EXPECTED_LABELS.length) {
    throw new Error(`Did not store the correct number of data fields. Found: ${data.length}, Expected: ${EXPECTED_LABELS.length}.`);
  }

  // The isolation data is stored in a different box, so get that.
  const isolationBox = $('.column1 > div:nth-child(2) > div:nth-child(1)');

  // Ensure that we found the isolation data.
  if (isolationBox.length !== 1) {
    throw new Error('Did not find the isolation box.');
  }

  const field = isolationBox.find('.figure');
  const label = isolationBox.find('.fact');

  // Ensure we have the expected label and field.
  if (field.length !== 1 || label.length !== 1) {
    throw new Error(`Did not find the correct number of data fields. Found: ${field.length}, Expected: 1.`);
  }

  if (label.text().trim() !== EXPECTED_ISOLATION_LABEL) {
    throw new Error(`Labels have changed, please fix scraper. Failed labels: ${EXPECTED_ISOLATION_LABEL}.`);
  }

  // Convert the field into a number, stripping commas, and add to the data array.
  const isolation = parseInt($(field).text().replace(/,/g, ''), 10);

  if (Number.isNaN(isolation)) {
    throw new Error('Parse int failed.');
  }

  // Store the BC data in an object.
  const bcData = {
    totalTested: data[0],
    totalPositive: data[1],
    undergradTested: data[2],
    undergradPositive: data[3],
    isolation,
  };

  console.log('BC Complete.');

  return bcData;
};

const generateRequest = (command: any) => {
  const query = {
    Commands: [
      {
        SemanticQueryDataShapeCommand: command,
      },
    ],
  };

  const request = {
    version: '1.0.0',
    queries: [{
      Query: query,
      QueryId: '',
      ApplicationContext: {
        DatasetId: '05640cb4-075c-4bec-87d1-2b0b7df65918',
        Sources: [{
          ReportId: '0f711970-f662-4b15-9c08-1d4090b80ec9',
        }],
      },
    }],
    cancelQueries: [],
    modelId: 11982553,
  };

  return request;
};

const tryTraverse = (obj: any, path: (string | number)[]): any => {
  if (path.length === 0) return obj;

  const [first, ...rest] = path;
  if (!obj[first]) {
    throw new Error(`Try traverse failed: '${first}' not found in object.`);
  }

  return tryTraverse(obj[first], rest);
};

const scrapeBU = async (): Promise<IBUData> => {
  console.log('Scraping BU...');

  const dataCommand = {
    Query: {
      Version: 2,
      From: [{ Name: 'c', Entity: 'Cumulative Testing Combined', Type: 0 }],
      Select: [
        {
          Measure: {
            Expression: { SourceRef: { Source: 'c' } },
            Property: 'Cumulative Positives',
          },
          Name: 'Cumulative Testing Combined.Cumulative Positives',
        },
      ],
      OrderBy: [{
        Direction: 2,
        Expression: {
          Measure: {
            Expression: {
              SourceRef: {
                Source: 'c',
              },
            },
            Property: 'Cumulative Results',
          },
        },
      }],
    },
    Binding: {
      Primary: { Groupings: [{ Projections: [0] }] },
      DataReduction: { DataVolume: 3, Primary: { Window: {} } },
      Version: 1,
    },
  };

  // Attempt to load the webpage.
  const res = await superagent.post(BU_URL)
    .send(generateRequest(dataCommand))
    .set('X-PowerBI-ResourceKey', '32890e38-8890-48a0-8e02-4bb47c05988d')
    .set('Accept', 'application/json');

  if (res.status !== 200) {
    throw new Error(`Request failed with error code ${res.status}.`);
  }

  const data = JSON.parse(res.text);

  const buPositive = tryTraverse(data, ['results', 0, 'result', 'data', 'dsr', 'DS', 0,
    'PH', 0, 'DM0', 0, 'M0']);

  const buData = { buPositive };

  console.log('BU Complete.');

  return buData;
};

const scrapeNeu = async (): Promise<INEUData> => {
  console.log('Scraping NEU...');

  // Attempt to load the webpage.
  const res = await superagent.get(NEU_URL);
  if (res.status !== 200) {
    throw new Error(`Request failed with error code ${res.status}.`);
  }

  const data = res.body;

  const entries = data.feed.entry;
  const neuPositive = parseInt(entries[entries.length - 5].content.$t, 10);
  if (Number.isNaN(neuPositive)) {
    throw new Error('Parse int failed.');
  }

  const neuData = { neuPositive };

  console.log('NEU Complete.');

  return neuData;
};

const scrapeMass = () => new Promise<IMassData>((resolve, reject) => {
  console.log('Scraping Massachusetts...');

  let header = '';
  let suffolkPositive = 0;
  let massPositive = 0;

  superagent
    .get(MASS_COUNTY_CASES_DL)
    .pipe(csv.parse({ headers: true, skipRows: 1239, maxRows: 15 }))
    .on('error', reject)
    .on('headers', (headers: string[]) => {
      header = headers[headers.length - 1];
    })
    .on('data', (row: any) => {
      const countyCases = parseInt(row[header], 10);

      if (Number.isNaN(countyCases)) {
        throw new Error('Parse int failed.');
      }

      if (row.countyFIPS === SUFFOLK_FIPS) {
        suffolkPositive = countyCases;
      }

      massPositive += countyCases;
    })
    .on('end', (_rowCount: number) => {
      console.log('Massachusetts Complete.');
      resolve({ suffolkPositive, massPositive });
    });
});

const scrape = async () => {
  console.log('Scraping data...');
  const start = new Date().getTime();

  // Run all the scrapes as well as connectDB asynchronously.
  let results;
  try {
    results = await Promise.all([scrapeBC(), scrapeBU(), scrapeNeu(), scrapeMass(), connectDB()]);
  } catch (err) {
    error(err);
    console.log('At least one of the scrapes failed, see above. Exiting.');
    return;
  }

  console.log(`Scraping completed in ${new Date().getTime() - start} ms.`);

  const bcData = results[0] as IBCData;
  const buData = results[1] as IBUData;
  const neuData = results[2] as INEUData;
  const massData = results[3] as IMassData;

  const entry = new DataModel({
    ...bcData,
    ...buData,
    ...neuData,
    ...massData,
  });

  // Check that the new entry differs from the latest entry.
  const entries = await DataModel.find().sort({ date: -1 }).limit(1).exec();
  if (entries.length === 1) {
    const lastEntry = entries[0].toObject();

    const keys = Object.keys(entry.toObject()) as string[];

    const differs = keys.reduce((diff: boolean, key: string) => {
      if (diff) return diff;
      return !IGNORE_KEYS.includes(key) && lastEntry[key] !== (entry as any)[key];
    }, false);

    if (!differs) {
      // If they are exactly the same, don't create a new entry.
      console.log('Data is the same.');
      return;
    }
  }

  // Save the new entry.
  await entry.save();

  console.log('Saved.');
};

export default scrape;
