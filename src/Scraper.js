import { load } from 'cheerio';

class Scraper {
  getAnalyzedData(content) {
    return load(content);
  }
}

export default Scraper;
