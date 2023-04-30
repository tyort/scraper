const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const PORT = 8000;
const url = 'https://fem.encar.com/estimate/review-detail?id=97842';
const googleTranslateUrl = (from, to, text) => {
  return `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${to}&q=${text}`
}

const app = express();

(async () => {
  try {
    const res = await axios(url)
    const html = res.data;
    const $ = cheerio.load(html);
    const kksk = $('h2.Header_subject__xtdIR').text();
    console.log(kksk);
    const asdasd = await axios(googleTranslateUrl('ko', 'ru', encodeURI(kksk)));
    console.log(asdasd.data[0][0][0])
  } catch(err) {
    console.log(err)
  }
})();


app.listen(PORT, () => console.log(`server running  on PORT ${PORT}`));