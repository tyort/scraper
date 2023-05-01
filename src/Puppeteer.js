const puppeteer = require('puppeteer');

class Puppeteer {
  constructor() {
    this.launchOptions = {
      headless: "new"
    };
    this.goToOptions = {
      timeout: 0,
      waitUntil: 'networkidle0',
    };
    this.step = 0;
  }

  async getPageContent(url) {
    try {
      const browser = await puppeteer.launch(this.launchOptions);
      const page = await browser.newPage();
      await page.goto(url, this.goToOptions);

      const isPicsLoaded = await page.$$('.PhotoSwipe_list__AsRzI img');
      if (this.step >= 3) {
        throw new Error('Фотографии не загружаются. Было 3 попытки. Повторите запрос позднее');
      }
      if (isPicsLoaded.length === 0) {
        this.step++;
        return await this.getPageContent(url);
      }

      const content = await page.content();
      browser.close();
      return content;
    } catch(err) {
      throw err;
    }
  }


}

module.exports = {
  Puppeteer
}