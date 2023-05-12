import express from 'express';
import Scraper from './src/Scraper.js';
import Adapter from './src/Adapter.js';
import Puppeteer from './src/Puppeteer.js';
import { VEHICLE_URL } from './src/const.js';

const app = express();

const scraper = new Scraper();
const adapter = new Adapter();
const puppeteer = new Puppeteer();

(async () => {
  try {
    const content = await puppeteer.getPageContent(VEHICLE_URL);
    const $ = scraper.getAnalyzedData(content);
    const translatedData = await adapter.getContent($);
    console.log(translatedData);
  } catch (err) {
    console.log(err);
  }
})();

app.listen(process.env.DEV_SERVER_PORT, () =>
  console.log(`server running  on PORT ${process.env.DEV_SERVER_PORT}`)
);
