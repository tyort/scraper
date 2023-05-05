import Translator from './Translator.js';
import Timeout from 'await-timeout';

class Adapter {
  constructor() {
    this.timer = new Timeout();
    this.translator = new Translator({ original: 'ko', translation: 'ru' });
  }

  getUntranslatableContent(content) {
    const pics = [];
    content('.PhotoSwipe_list__AsRzI button img').each(function (index, image) {
      const srcData = content(image).attr('src');
      pics.push(srcData);
    });
    return pics;
  }

  async getContent(content) {
    const arr = await this.getTranslatedContentArr(content);
    return {
      offerTitle: arr[0],
      publicationDate: arr[1],
      price: arr[2],
      reviewSeller: arr[3],
      sellerInfo: {
        sellerName: arr[4],
        sellerComapny: arr[5],
        winningBets: arr[6],
        sellerRate: arr[7],
        ratePeriod: arr[8],
      },
      vehicleInfo: {
        name: arr[9],
        features: arr[17],
        color: arr[10],
        exchangeOrBuy: arr[11],
        rentHistory: arr[12],
        options: arr[16],
      },
      offerGrade: {
        bestPrice: arr[13],
        averagePrice: arr[14],
        biddersCount: arr[15],
      },
      images: arr[18],
    };
  }

  async getTranslatedContentArr(content) {
    const contentArr = this.getContentArr(content);
    const translatedContentArr = [];
    for (const portion of contentArr) {
      const res = await this.translator.getTranslation(portion);
      await Timeout.set(200);
      translatedContentArr.push(res);
    }
    const otherContent = this.getUntranslatableContent(content);
    return [...translatedContentArr, otherContent];
  }

  getContentArr(content) {
    const features = [];
    const addFeatures = [];
    const options = [];
    const dealerIndexes = [];
    const vehicleName = content('.CarInfo_name__yMacL.fs16.fwBold').text();
    content('.CarInfo_info__dlTdp.fs16.fcBlack2 .CarInfo_item__hBVr-').each(
      function (_index, feature) {
        const text = content(feature).text();
        features.push(text);
      }
    );
    content('table tr td').each(function (_index, feature) {
      const text = content(feature).text();
      addFeatures.push(text);
    });
    content('.CarInfo_options__wncbZ li ').each(function (_index, option) {
      const text = content(option).text();
      options.push(text);
    });
    content('.DealerInfo_sell_info__SdM1h.fs14.fcBlack2 li span').each(
      function (_index, item) {
        const text = content(item).text();
        dealerIndexes.push(text);
      }
    );

    return [
      content(
        '.ReviewDetail_area_car__vLgIZ.fs16.ReviewDetail_report__cdNg8'
      ).text(),
      content('.ReviewDetail_time__2zU0I.fs14.fcBlack3').text(),
      content('.ReviewDetail_price__CeeuP.fs14.fcBlack3').text(),
      content('.ReviewDetail_area_review_seller__o17ek.fs15.fcBlack2')
        .text()
        .replace(/\n/gim, ' '),
      content('[data-testid="dealerInfoName"]').text(),
      content('.DealerInfo_company__r66ob.fs15.fcBlack2').text(),
      dealerIndexes[0],
      dealerIndexes[1],
      content('.DealerInfo_sel_months__z6dPu.fs14.fcBlack3').text(),
      vehicleName.replace(/\n/gim, ' '),
      addFeatures[0],
      addFeatures[1],
      addFeatures[2],
      content('[data-testid="max"]').text(),
      content('[data-testid="min"]').text(),
      content('[data-testid="dealerCnt"]').text(),
      options,
      features,
    ];
  }
}

export default Adapter;
