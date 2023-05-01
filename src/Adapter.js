class Adapter {
  getContent(content) {
    const title = content('.ReviewDetail_area_car__vLgIZ.fs16.ReviewDetail_report__cdNg8').text();
    const publicationDate = content('.ReviewDetail_time__2zU0I.fs14.fcBlack3').text();
    const highestPrice = content('.ReviewDetail_price__CeeuP.fs14.fcBlack3').text();
    const pics = [];
    const asdasd = content('.PhotoSwipe_list__AsRzI button img')
      .each(function(index, item) {
        const lsld = content(item).attr('src');
        console.log(lsld);
      })

    const result = {
      ['Заголовок']: title,
      ['Дата публикации']: publicationDate,
      ['Самая высокая цена']: highestPrice,
      ['Фото']: pics
    }

    return JSON.stringify(result);
  }
}

module.exports = {
  Adapter
}
