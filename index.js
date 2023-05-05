import express from 'express';
import Scraper from './src/Scraper.js';
import Adapter from './src/Adapter.js';
import Puppeteer from './src/Puppeteer.js';

const PORT = 8000;
const url = 'https://fem.encar.com/estimate/review-detail?id=97842';

const app = express();

const scraper = new Scraper(); 
const adapter = new Adapter();
const puppeteer= new Puppeteer();

(async () => {
  try {
    const content = await puppeteer.getPageContent(url);
    const $ = scraper.getAnalyzedData(content);
    const translatedData = await adapter.getContent($);
    console.log(translatedData);
  } catch(err) {
    console.log(err)
  }
})();


app.listen(PORT, () => console.log(`server running  on PORT ${PORT}`));