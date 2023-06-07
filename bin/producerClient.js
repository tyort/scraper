import pkg from 'nats';
const { JSONCodec } = pkg;
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
    await natsService.subscribe(SUBJECT_OBJ, OBJ_RECIEVER);
    const response = natsService.fetchMessages(
      STREAM_NAME,
      OBJ_RECIEVER,
      120000
    );
    const messages = [];

    for await (const m of response) {
      messages.push(JSONCodec().decode(m.data));
      console.log(
        `[${m.seq}] ${
          m.redelivered ? `- redelivery ${m.info.redeliveryCount}` : ''
        }`
      );
      // console.log(m.info);
      if (m.data) {
        m.ack();
      }
    }

    if (!messages.length) {
      throw new Error('There is no new messages from consumer');
    }

    console.log(messages);
  } catch (err) {
    console.log(err);
  } finally {
    // await natsService.deleteStream(STREAM_NAME);
    // await natsService.connection.drain();
  }
}

main().then();
