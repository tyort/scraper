import { setIntervalAsync } from 'set-interval-async';
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
    await natsService.addStream(STREAM_NAME, PREFIX_SUBJECT);
    await natsService.addConsumer(STREAM_NAME, URL_RECIEVER, SUBJECT_URL);
    await natsService.subscribe(SUBJECT_URL, URL_RECIEVER);

    setIntervalAsync(async () => {
      const response = natsService.fetchMessages(
        STREAM_NAME,
        URL_RECIEVER,
        3000
      );
      const messages = await natsService.getMessages(response, 'string');
      console.log(messages);
      console.log('start parcing');

      for (const urlData of messages) {
        const translatedData = await scrapeData.process(urlData);
        console.log(translatedData);
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
    }, 5000);
  } catch (err) {
    console.log(err);
  }
}

main().then();
