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

  // async NATSMessageQueuePrototypePullSubscribe(
  //   ctx,
  //   subject,
  //   durable,
  //   deleteMsgAfterAck,
  //   handler
  // ) {
  //   const subjectParts = subject.split('.');
  //   if (subjectParts.length <= 1) {
  //     throw new Error(`invalid subject '${subject}'`);
  //   }
  //   const streamName = subjectParts.slice(0, -1).join('.');
  //   let sub = await mq.js.subscribe(subject, { durable_name: durable });
  //   let waitBeforeFetch = false;
  //   mq.wg.add(1);
  //   mq.wg.done();
  //   sub.unsubscribe();

  //   while (true) {
  //     if (mq.ctx.done) {
  //       return mq.ctx.error;
  //     } else if (ctx.done) {
  //       return ctx.error;
  //     }
  //     if (waitBeforeFetch) {
  //       if (mq.config.reconnectWait !== null) {
  //         setTimeout(() => {
  //           setTimeout(() => {
  //             waitBeforeFetch = false;
  //           }, mq.config.reconnectWait);
  //         }, mq.config.reconnectWait);
  //       } else {
  //         setTimeout(() => {
  //           waitBeforeFetch = false;
  //         }, 30000);
  //       }
  //     }
  //     let msgs, err;
  //     [msgs, err] = sub.fetch(1, nats.Context(mq.ctx));
  //     if (err !== null) {
  //       if (
  //         !err.includes(context.DeadlineExceeded) &&
  //         !err.includes(context.Canceled)
  //       ) {
  //         mq.config.errorHandler(
  //           new Error(`can't fetch from '${subject}': ${err}`)
  //         );
  //         waitBeforeFetch = true;
  //       }
  //       continue;
  //     }

  //     let msg = msgs[0];
  //     msg.InProgress();
  //     if (let err = handler(msg.Data)) {
  //         if (mq.config.nakDelay != 0) {
  //             msg.NakWithDelay(mq.config.nakDelay);
  //         } else {
  //             msg.Nak();
  //         }
  //         mq.config.errorHandler(new Error(`can't handle message from '${subject}': ${err}`));
  //     } else {
  //         msg.Ack();
  //         if (deleteMsgAfterAck) {
  //             let meta, err = msg.Metadata();
  //             if (!err) {
  //                 if (let err = mq.js.DeleteMsg(streamName, meta.Sequence.Stream)) {
  //                     mq.config.errorHandler(new Error(`can't delete from '${subject}': ${err}`));
  //                 }
  //             }
  //         }
  //     }
  //   }
  // }

  async subscribe(subj, durable) {
    if (!this.jsc) {
      console.log('There is no jetstream client');
      return;
    }

    await this.jsc.pullSubscribe(subj, {
      mack: true,
      config: {
        durable_name: durable,
        ack_policy: AckPolicy.Explicit,
        ack_wait: nanos(500),
      },
    });
  }

  fetchMessages(streamName, durable, commonTime) {
    if (!this.jsc) {
      console.log('There is no jetstream client');
      return;
    }

    return this.jsc.fetch(streamName, durable, {
      batch: 1,
      expires: commonTime,
    });
  }

  async getMessages(data, codecContent) {
    const messages = [];
    const codec = codecContent === 'string' ? StringCodec() : JSONCodec();
    for await (const m of data) {
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

    if (!messages.length) {
      throw new Error('There is no new messages from producer');
    }

    return messages;
  }

  async addConsumer(streamName, durableName, subj) {
    if (!this.jsm) {
      console.log('There is no jetstream manager');
      return;
    }

    try {
      const consumer = await this.jsm.consumers.info(streamName, durableName);
      console.log(consumer);
    } catch (err) {
      if (err.message === 'consumer not found') {
        await this.jsm.consumers.add(streamName, {
          durable_name: durableName,
          ack_policy: AckPolicy.Explicit,
          filter_subject: subj,
        });
      }
    }
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
