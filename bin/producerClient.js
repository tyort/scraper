import { VEHICLE_URL } from '../src/const.js';
import NatsService from '../src/services/NatsService.js';

const STREAM_NAME = 'encarStream';
const SUBJECT = 'encarSubj.*';
const CURRENT_SUBJECT = 'encarSubj.unit';

const natsService = new NatsService();

async function main() {
  try {
    await natsService.connect('producer-connection');
    await natsService.addStream(STREAM_NAME, SUBJECT);
    await natsService.publish(STREAM_NAME, CURRENT_SUBJECT, VEHICLE_URL);
    await natsService.publish(STREAM_NAME, 'encarSubj.test', 'what is this?');
  } catch (err) {
    console.log(err);
  } finally {
    // await natsService.deleteStream(STREAM_NAME);
    await natsService.connection.drain();
  }
}

main().then();
