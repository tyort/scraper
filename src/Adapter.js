class Adapter {
  getUntranslatableContent(content) {
    const pics = [];
    content('.PhotoSwipe_list__AsRzI button img')
      .each(function(index, image) {
        const srcData = content(image).attr('src');
        pics.push(srcData);
      });
    return pics;
  }

  getContent(content) {
    const features = [];
    const addFeatures = [];
    const options = [];
    const dealerIndexes = [];
    const sellerComment = content('.ReviewDetail_area_review_seller__o17ek.fs15.fcBlack2').text();
    const comment = content('.ReviewDetail_review_chat__3246N.fcBlack2').text();
    const vehicleName = content('.CarInfo_name__yMacL.fs16.fwBold').text();
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
      });
    content('.DealerInfo_sell_info__SdM1h.fs14.fcBlack2 li span')
      .each(function(_index, item) {
        const text = content(item).text();
        dealerIndexes.push(text);
      });

    const result = {
      "title": content('.ReviewDetail_area_car__vLgIZ.fs16.ReviewDetail_report__cdNg8').text(),
      "publicationDate": content('.ReviewDetail_time__2zU0I.fs14.fcBlack3').text(),
      "highestPrice": content('.ReviewDetail_price__CeeuP.fs14.fcBlack3').text(),
      "sellerComment": sellerComment.replace(/\n/gmi, ' '),
      "newDealer": {
        "dealerName": content('[data-testid="dealerInfoName"]').text(),
        "dalerCompany": content('.DealerInfo_company__r66ob.fs15.fcBlack2').text(),
        "winningBets": dealerIndexes[0],
        "dealerRate": dealerIndexes[1],
        "ratePer": content('.DealerInfo_sel_months__z6dPu.fs14.fcBlack3').text()
      },
      "vehicle": {
        "mainInfo": {
          "title": vehicleName.replace(/\n/gmi, ' '),
          "features": features
        },
        "addInfo": {
          "vehicleColor": addFeatures[0],
          "exchangeBuy": addFeatures[1],
          "rentHist": addFeatures[2]
        },
        "optionsList": options,
        "costRatio": {
          "bestCost": content('[data-testid="max"]').text(),
          "averageCost": content('[data-testid="min"]').text(),
          "biddersAmount": content('[data-testid="dealerCnt"]').text()
        }
      }
    }

    return JSON.stringify(result);
  }
}

module.exports = {
  Adapter
}
