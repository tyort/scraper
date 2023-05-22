import {
  VEHICLE_URL,
  STREAM_NAME,
  PREFIX_SUBJECT,
  SUBJECT_URL,
  SUBJECT_OBJ,
  OBJ_RECIEVER,
} from '../src/const.js';
import NatsService from '../src/services/NatsService.js';

const natsService = new NatsService();

async function main() {
  try {
    await natsService.connect('producer-connection');
    await natsService.setJsm();
    await natsService.addStream(STREAM_NAME, PREFIX_SUBJECT);
    await natsService.setJsc();
    await natsService.publish(
      STREAM_NAME,
      SUBJECT_URL,
      VEHICLE_URL,
      VEHICLE_URL.split('id=')[1],
      'string'
    );
    await natsService.publish(
      STREAM_NAME,
      'encarSubj.test',
      'what is this?',
      'ecwe323d',
      'string'
    );

    await natsService.addConsumer(STREAM_NAME, OBJ_RECIEVER, SUBJECT_OBJ);
    const res = await natsService.subscribe(
      SUBJECT_OBJ,
      STREAM_NAME,
      OBJ_RECIEVER,
      'object',
      120000
    );

    if (!res.length) {
      throw new Error('There is no new messages from consumer');
    }

    console.log(res);
  } catch (err) {
    console.log(err);
  } finally {
    // await natsService.deleteStream(STREAM_NAME);
    // await natsService.connection.drain();
  }
}

main().then();
