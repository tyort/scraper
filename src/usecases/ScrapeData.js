import Scraper from '../Scraper.js';
import Adapter from '../Adapter.js';
import Puppeteer from '../Puppeteer.js';

export default class ScrapeData {
  constructor() {
    this.scraper = new Scraper();
    this.adapter = new Adapter();
    this.puppeteer = new Puppeteer();
  }

  async process(data) {
    try {
      const content = await this.puppeteer.getPageContent(data);
      const $ = this.scraper.getAnalyzedData(content);
      const translatedData = await this.adapter.getContent($);
      return translatedData;
    } catch (err) {
      console.log(err);
    }
  }
}
