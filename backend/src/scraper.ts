import cheerio from 'cheerio';
import superagent from 'superagent';

import connectDB from './lib/db';
import DataModel from './models/Data';

const DATA_URL = 'https://www.bc.edu/content/bc-web/sites/reopening-boston-college.html';

const EXPECTED_LABELS = [
  'BC Community Members Tested',
  'Total Positives',
  'Undergrads Tested',
  'Undergrads Testing Positive',
];

const EXPECTED_ISOLATION_LABEL = 'Undergrads Currently in Isolation';

const scrape = async () => {
  await connectDB();

  console.log('Scraping data...');

  // Attempt to load the webpage.
  let res;
  try {
    res = await superagent.get(DATA_URL);
    if (res.status !== 200) {
      console.error(`Request failed with error code ${res.status}.`);
      return;
    }
  } catch (err) {
    console.error(err);
    return;
  }

  const $ = cheerio.load(res.text);

  // Extra the grid of data items from the page.
  const dataBoxes = $('.fact-gray-new > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)');

  // Ensure that we found the grid.
  if (dataBoxes.length !== 1) {
    console.error('Did not find the data boxes');
    return;
  }

  const fields = dataBoxes.find('.figure');
  const labels = dataBoxes.find('.fact');

  // Ensure we have the expected labels and fields.
  if (fields.length !== EXPECTED_LABELS.length || labels.length !== EXPECTED_LABELS.length) {
    console.error('Did not find the correct number of data fields.');
    return;
  }

  let isDataCorrect = true;
  labels.each(function f(this: Cheerio, i: number, _elem: any) {
    if ($(this).text().trim() !== EXPECTED_LABELS[i]) {
      isDataCorrect = false;
    }

    return isDataCorrect;
  });

  if (!isDataCorrect) {
    console.error('Labels have changed, please fix scraper.');
    return;
  }

  const data: number[] = [];

  // Convert the fields into numbers, stripping commas, and add to the data array.
  fields.each(function f(this: Cheerio, _i: number, _elem: any) {
    data.push(parseInt($(this).text().replace(/,/g, ''), 10));
  });

  if (data.length !== EXPECTED_LABELS.length) {
    console.error('Did not store the correct number of data fields.');
    return;
  }

  // The isolation data is stored in a different box, so get that.
  const isolationBox = $('.column1 > div:nth-child(2) > div:nth-child(1)');

  // Ensure that we found the isolation data.
  if (isolationBox.length !== 1) {
    console.error('Did not find the isolation box.');
    return;
  }

  const field = isolationBox.find('.figure');
  const label = isolationBox.find('.fact');

  // Ensure we have the expected label and field.
  if (field.length !== 1 || label.length !== 1) {
    console.error('Did not find the correct number of data fields.');
    return;
  }

  if (label.text().trim() !== EXPECTED_ISOLATION_LABEL) {
    console.error('Labels have changed, please fix scraper.');
    return;
  }

  // Convert the field into a number, stripping commas, and add to the data array.
  data.push(parseInt($(field).text().replace(/,/g, ''), 10));

  // Create a new data entry from the extracted data.
  const entry = new DataModel({
    totalTested: data[0],
    totalPositive: data[1],
    undergradTested: data[2],
    undergradPositive: data[3],
    isolation: data[4],
  });

  // Check that the new entry differs from the latest entry.
  const entries = await DataModel.find().sort({ date: -1 }).limit(1).exec();
  if (entries.length === 1) {
    const lastEntry = entries[0];

    if (lastEntry.totalTested === entry.totalTested
      && lastEntry.totalPositive === entry.totalPositive
      && lastEntry.undergradTested === entry.undergradTested
      && lastEntry.undergradPositive === entry.undergradPositive
      && lastEntry.isolation === entry.isolation) {
      // If they are exactly the same, don't create a new entry.
      console.log('Data is the same.');
      return;
    }
  }

  // Save the new entry.
  await entry.save();

  console.log('Complete.');
};

export default scrape;
