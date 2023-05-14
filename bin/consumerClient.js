import {
  STREAM_NAME,
  PREFIX_SUBJECT,
  SUBJECT_URL,
  URL_RECIEVER,
} from '../src/const.js';
import NatsService from '../src/services/NatsService.js';

const natsService = new NatsService();

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
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

main().then();
