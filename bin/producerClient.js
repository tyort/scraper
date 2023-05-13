import { VEHICLE_URL } from '../src/const.js';
import NatsService from '../src/services/NatsService.js';

const STREAM_NAME = 'encarStream';
const SUBJECT = 'encarSubj.*';

const natsService = new NatsService();

async function main() {
  try {
    await natsService.connect('producer-connection');
    await natsService.setJsm();
    await natsService.addStream(STREAM_NAME, SUBJECT);
    await natsService.setJsc();
    await natsService.publish(STREAM_NAME, 'encarSubj.unit', VEHICLE_URL);
  } catch (err) {
    console.log(err);
  } finally {
    // await natsService.deleteStream(STREAM_NAME);
    await natsService.connection.drain();
  }
}

main().then();
