const axios = require('axios');
class Translator {
  constructor({original, translation}) {
    this.url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${original}&tl=${translation}&q=`;
  };

  async getTranslation(content) {
    const totalUrl = `${this.url}${encodeURI(content)}`;
    const translatedContent = await axios(totalUrl);
    return JSON.parse(translatedContent.data[0][0][0]);
  };
}

module.exports = {
  Translator
}