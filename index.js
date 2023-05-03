const express = require('express');
const { Scraper } = require('./src/Scraper');
const { Adapter } = require('./src/Adapter');
const { Puppeteer } = require('./src/Puppeteer');

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