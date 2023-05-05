import cheerio from 'cheerio';

class Scraper {
  getAnalyzedData(content) {
    return cheerio.load(content);
  }
}

export default Scraper;
