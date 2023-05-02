const cheerio = require('cheerio');

class Scraper {
  getAnalyzedData(content) {
    return cheerio.load(content);
  }
}

module.exports = {
  Scraper
}