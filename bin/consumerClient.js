import pkg from 'nats';
const { consumerOpts, StringCodec, nanos, AckPolicy } = pkg;

import NatsService from '../src/services/NatsService.js';

const CURRENT_SUBJECT = 'encarSubj.unit';
const STREAM_NAME = 'encarStream';
const DURABLE_NAME = 'encarSubscriber';
const natsService = new NatsService();

async function main() {
  try {
    await natsService.connect('consumer-connection');
    await natsService.setJsc();

    const opts = consumerOpts();
    opts.deliverTo('encar');

    // let sub = await natsService.jsc.subscribe(CURRENT_SUBJECT, opts);
    // for await (const m of sub) {
    //   console.log(StringCodec().decode(m.data));
    //   m.ack();
    // }

    await natsService.jsc.pullSubscribe(CURRENT_SUBJECT, {
      mack: true,
      // artificially low ack_wait, to show some messages
      // not getting acked being redelivered
      config: {
        durable_name: DURABLE_NAME,
        ack_policy: AckPolicy.Explicit,
        ack_wait: nanos(4000),
      },
    });

    let msgs = await natsService.jsc.fetch(STREAM_NAME, DURABLE_NAME, {
      batch: 10,
      expires: 5000,
    });

    for await (const m of msgs) {
      console.log(StringCodec().decode(m.data));
      // m.ack();
    }
  } catch (err) {
    console.log(err);
  }
}

main().then();
