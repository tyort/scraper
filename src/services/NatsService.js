import pkg from 'nats';
const { connect, StringCodec } = pkg;

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
      return;
    }
    this.jsm = await this.connection.jetstreamManager();
  }

  async setJsc() {
    if (!this.connection) {
      return;
    }
    this.jsc = await this.connection.jetstream();
  }

  async publish(streamName, subj, message) {
    await this.setJsc();
    if (!this.jsc) {
      return;
    }

    await this.jsc.publish(subj, StringCodec().encode(message), {
      msgID: message.split('id=')[1],
      expect: { streamName: streamName },
    });
  }

  async findStream(streamName) {
    if (!this.jsm) {
      return;
    }
    try {
      return await this.jsm.streams.info(streamName);
    } catch (err) {
      return err.message === 'stream not found' && null;
    }
  }

  async addStream(streamName, subject) {
    await this.setJsm();
    const currentStream = await this.findStream(streamName);
    if (!currentStream && this.jsm) {
      await this.jsm.streams.add({ name: streamName, subjects: [subject] });
    }
  }

  async deleteStream(streamName) {
    const currentStream = await this.findStream(streamName);
    if (currentStream && this.jsm) {
      await this.jsm.streams.delete(streamName);
    }
  }
}

export default NatsService;
