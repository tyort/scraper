import axios from 'axios';
class Translator {
  constructor({ original, translation }) {
    this.url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${original}&tl=${translation}&q=`;
  }

  async getTranslation(content) {
    const totalUrl = `${this.url}${encodeURI(content)}`;
    const response = await axios(totalUrl);
    return response.data[0][0][0];
  }
}

export default Translator;
