import pkg from 'nats';
const { connect, StringCodec, JSONCodec, AckPolicy, nanos } = pkg;

class NatsService {
  constructor() {
    this.connection = null;
    this.jsm = null;
    this.jsc = null;
  }

  async connect(name) {
    this.connection = await connect({
      name,
      verbose: true,
      reconnect: false,
      reconnectTimeWait: 10 * 1000,
      maxReconnectAttempts: 10,
      pingInterval: 20 * 1000,
      servers: [
        `${process.env.NATS_SERVER_HOST}:${process.env.NATS_SERVER_PORT}`,
      ],
      token: process.env.TOKEN,
      // debug: true,
    });
    return this.connection;
  }

  async setJsm() {
    if (!this.connection) {
      console.log('There is no connection to nats-server');
      return;
    }
    this.jsm = await this.connection.jetstreamManager();
  }

  async setJsc() {
    if (!this.connection) {
      console.log('There is no connection to nats-server');
      return;
    }
    this.jsc = await this.connection.jetstream();
  }

  async publish(streamName, subj, message, msgID, msgType) {
    if (!this.jsc) {
      console.log('There is no jetstream client');
      return;
    }

    const codec = msgType === 'string' ? StringCodec() : JSONCodec();
    await this.jsc.publish(subj, codec.encode(message), {
      msgID,
      expect: { streamName: streamName },
    });
  }

  async subscribe(subj, streamName, durable, msgType, commonTime) {
    if (!this.jsc) {
      console.log('There is no jetstream client');
      return;
    }

    const messages = [];

    await this.jsc.pullSubscribe(subj, {
      mack: true,
      config: {
        durable_name: durable,
        ack_policy: AckPolicy.Explicit,
        ack_wait: nanos(500),
      },
    });

    let msgs = await this.jsc.fetch(streamName, durable, {
      batch: 10,
      expires: commonTime,
    });

    const codec = msgType === 'string' ? StringCodec() : JSONCodec();
    for await (const m of msgs) {
      messages.push(codec.decode(m.data));
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

    return messages;
  }

  async addConsumer(streamName, durableName, subj) {
    if (!this.jsm) {
      console.log('There is no jetstream manager');
      return;
    }
    await this.jsm.consumers.add(streamName, {
      durable_name: durableName,
      ack_policy: AckPolicy.Explicit,
      filter_subject: subj,
    });
  }

  async findStream(streamName) {
    if (!this.jsm) {
      console.log('There is no jetstream manager');
      return;
    }
    try {
      return await this.jsm.streams.info(streamName);
    } catch (err) {
      console.log(err.message);
      return err.message === 'stream not found' && null;
    }
  }

  async addStream(streamName, subject) {
    if (!this.jsm) {
      console.log('There is no jetstream manager');
      return;
    }
    const currentStream = await this.findStream(streamName);
    if (!currentStream) {
      await this.jsm.streams.add({
        name: streamName,
        subjects: [subject],
        duplicate_window: nanos(4000),
      });
    }
  }

  async deleteStream(streamName) {
    if (!this.jsm) {
      console.log('There is no jetstream manager');
      return;
    }
    const currentStream = await this.findStream(streamName);
    if (currentStream) {
      await this.jsm.streams.delete(streamName);
    }
  }
}

export default NatsService;
