import cors from 'cors';
import { CronJob } from 'cron';
import express from 'express';
import path from 'path';
import { DocumentType } from 'typegoose';

import DataModel, { Data } from './models/Data';
import connectDB from './lib/db';
import scrape from './scraper';

const PORT = process.env.PORT || 5000;
const app = express();

const corsOptionsDelegate = (req: any, callback: any) => {
  const corsOptions = {
    origin: false,
    credentials: true,
  };

  const whitelist = [
    process.env.URL || 'http://localhost:3000',
  ];

  if (process.env.NODE_ENV !== 'production' || whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions.origin = true; // reflect (enable) the requested origin in the CORS response
  }

  callback(null, corsOptions); // callback expects two parameters: error and options
};

const webClient = path.join(__dirname, '..', '..', 'frontend', 'build');

app.use(cors(corsOptionsDelegate));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(webClient));
}

app.use('/data', async (req, res) => {
  await connectDB();

  let query = {};
  if (req.query.q) {
    query = JSON.parse(req.query.q as string);
  }

  // Fetch the data and sort in ascending order.
  const data = await DataModel.find(query).sort({ date: +1 }).exec();

  // Rename _id to id and remove __v.
  const cleanedData = data.map((entry: DocumentType<Data>) => {
    const entryObject = entry.toObject();

    // eslint-disable-next-line
    const { _id, __v, ...cleanedEntry } = entryObject;

    return { id: _id, ...cleanedEntry };
  });

  res.json(cleanedData);
});

app.use('/api/*', (req, res) => { // Handle 404
  res.status(404).write(`Cannot ${req.method} ${req.url}`);
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webClient, 'index.html'));
  });
}

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}.`);

  // Run the scraper once now.
  await scrape();

  // Run the scraper at the start of every hour.
  const job = new CronJob('0 0 * * * *', scrape);
  job.start();
});
