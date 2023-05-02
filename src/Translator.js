const axios = require('axios');
class Translator {
  constructor({original, translation}) {
    this.url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${original}&tl=${translation}&q=`;
  };

  async getTranslation(content) {
    const totalUrl = `${this.url}${encodeURI(content)}`;
    const response = await axios(totalUrl);
    // const translation = JSON.parse(response.data[0][0][0]);
    return response.data[0][0][0];
  };
}

module.exports = {
  Translator
}