import {
  STREAM_NAME,
  PREFIX_SUBJECT,
  SUBJECT_URL,
  URL_RECIEVER,
} from '../src/const.js';
import NatsService from '../src/services/NatsService.js';
import ScrapeData from '../src/usecases/ScrapeData.js';

const natsService = new NatsService();
const scrapeData = new ScrapeData();

async function main() {
  try {
    await natsService.connect('consumer-connection');
    await natsService.setJsc();
    await natsService.setJsm();
    await natsService.addConsumer(STREAM_NAME, URL_RECIEVER, SUBJECT_URL);
    const res = await natsService.subscribe(
      PREFIX_SUBJECT,
      STREAM_NAME,
      URL_RECIEVER
    );

    if (!res.length) {
      throw new Error('There is no new messages from producer');
    }

    const translatedDataArr = [];
    for (const urlData of res) {
      const translatedData = await scrapeData.process(urlData);
      translatedDataArr.push(translatedData);
    }
    console.log(translatedDataArr);
  } catch (err) {
    console.log(err);
  }
}

main().then();
