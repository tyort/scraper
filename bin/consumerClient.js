import {
  STREAM_NAME,
  PREFIX_SUBJECT,
  SUBJECT_URL,
  URL_RECIEVER,
  SUBJECT_OBJ,
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
      URL_RECIEVER,
      'string'
    );

    if (!res.length) {
      throw new Error('There is no new messages from producer');
    }

    for (const urlData of res) {
      const translatedData = await scrapeData.process(urlData);
      await natsService.publish(
        STREAM_NAME,
        SUBJECT_OBJ,
        translatedData,
        translatedData.id,
        'object'
      );
      await natsService.publish(
        STREAM_NAME,
        'encarSubj.test',
        'Hey, whats wrong?',
        'asda2342sds',
        'string'
      );
    }
  } catch (err) {
    console.log(err);
  }
}

main().then();
