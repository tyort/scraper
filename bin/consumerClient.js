import pkg from 'nats';
const { consumerOpts, StringCodec } = pkg;

import NatsService from '../src/services/NatsService.js';

const CURRENT_SUBJECT = 'encarSubj.unit';
const natsService = new NatsService();

async function main() {
  try {
    await natsService.connect('consumer-connection');
    await natsService.setJsc();

    const opts = consumerOpts();
    opts.deliverTo('encar');

    let sub = await natsService.jsc.subscribe(CURRENT_SUBJECT, opts);
    for await (const m of sub) {
      console.log(StringCodec().decode(m.data));
      m.ack();
    }
  } catch (err) {
    console.log(err);
  }
}

main().then();
