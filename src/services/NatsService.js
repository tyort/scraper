import pkg from 'nats';
const { connect, StringCodec, AckPolicy } = pkg;

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

  async publish(streamName, subj, message) {
    if (!this.jsc) {
      console.log('There is no jetstream client');
      return;
    }

    await this.jsc.publish(subj, StringCodec().encode(message), {
      msgID: message.split('id=')[1],
      expect: { streamName: streamName },
    });
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
      await this.jsm.streams.add({ name: streamName, subjects: [subject] });
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
