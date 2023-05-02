class Adapter {
  getContent(content) {
    const title = content('.ReviewDetail_area_car__vLgIZ.fs16.ReviewDetail_report__cdNg8').text();
    const publicationDate = content('.ReviewDetail_time__2zU0I.fs14.fcBlack3').text();
    const highestPrice = content('.ReviewDetail_price__CeeuP.fs14.fcBlack3').text();
    const pics = [];
    const features = [];
    const addFeatures = [];
    const options = [];
    content('.PhotoSwipe_list__AsRzI button img')
      .each(function(index, image) {
        const srcData = content(image).attr('src');
        pics.push({ [`pic${index + 1}`]: srcData })
      });
    const sellerComment = content('.ReviewDetail_area_review_seller__o17ek.fs15.fcBlack2').text();
    const newDealer = content('.ReviewDetail_review_chat__3246N.fcBlack2').text();
    const name = content('.CarInfo_name__yMacL.fs16.fwBold').text();
    content('.CarInfo_info__dlTdp.fs16.fcBlack2 .CarInfo_item__hBVr-')
      .each(function(_index, feature) {
        const text = content(feature).text();
        features.push(text);
      });
    content('table tr td')
      .each(function(_index, feature) {
        const text = content(feature).text();
        addFeatures.push(text);
      });
    content('.CarInfo_options__wncbZ li ')
      .each(function(_index, option) {
        const text = content(option).text();
        options.push(text);
      })
    const bestCost = content('[data-testid="max"]').text();
    const averageCost = content('[data-testid="min"]').text();
    const bidders = content('[data-testid="dealerCnt"]').text();
    

    const result = {
      title,
      publicationDate,
      highestPrice,
      pics,
      sellerComment: sellerComment.replace(/\n/gmi, ' '),
      newDealer,
      vehicle: {
        mainInfo: {
          name: name.replace(/\n/gmi, ' '),
          features
        },
        addInfo: {
          color: addFeatures[0],
          exchangeBuy: addFeatures[1],
          rentHistory: addFeatures[2]
        },
        options,
        costRatio: {
          bestCost,
          averageCost,
          bidders
        }
      }
    }

    return JSON.stringify(result);
  }
}

module.exports = {
  Adapter
}
