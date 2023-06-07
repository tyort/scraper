import {
  VEHICLE_URL,
  STREAM_NAME,
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
    await natsService.subscribe(SUBJECT_OBJ, OBJ_RECIEVER);
    const response = natsService.fetchMessages(
      STREAM_NAME,
      OBJ_RECIEVER,
      120000
    );
    const messages = await natsService.getMessages(response, 'object');
    console.log(messages);
    await natsService.connection.drain();
  } catch (err) {
    console.log(err);
  }
}

main().then();
