const cheerio = require('cheerio');
const axios = require('axios');

class Scraper {
  getAnalyzedData(content) {
    return cheerio.load(content);
  }
}

module.exports = {
  Scraper
}