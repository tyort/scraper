import pkg from 'nats';
const { connect, Empty, StringCodec } = pkg;

const STREAM_NAME = 'encarStream';
const SUBJECT = 'encarSubj.*';
const SC = StringCodec();
let nc;
let jsm;

async function main() {
  try {
    nc = await connect({
      name: 'tyort-connection',
      verbose: true,
      // reconnect: false,
      reconnectTimeWait: 10 * 1000,
      maxReconnectAttempts: 10,
      // pingInterval: 20 * 1000,
      servers: [
        `${process.env.NATS_SERVER_HOST}:${process.env.NATS_SERVER_PORT}`,
      ],
      // token: process.env.TOKEN,
      // debug: true,
    });

    jsm = await nc.jetstreamManager();
    await jsm.streams.add({ name: STREAM_NAME, subjects: [SUBJECT] });
    const jsClient = await nc.jetstream();
    let pa = await jsClient.publish('encarSubj.D', Empty, {
      msgID: '123asnfdk132',
      expect: { streamName: STREAM_NAME },
    });

    console.log(pa);
  } catch (err) {
    console.log(err);
  } finally {
    await jsm.streams.delete(STREAM_NAME);
    await nc.drain();
  }
}

main().then();

// // you can find out where you connected:
// console.log(`connected to a nats server version ${nc.info.version}`);

// // or information about the data in/out of the client:
// const stats = nc.stats();
// console.log(
//   `client sent ${stats.outMsgs} messages and received ${stats.inMsgs}`
// );

// nc.closed().then(() => {
//   console.log('the connection closed!');
// });

// (async () => {
//   for await (const s of nc.status()) {
//     switch (s.type) {
//       case Status.Disconnect:
//         console.log(`client disconnected - ${s.data}`);
//         break;
//       case Status.LDM:
//         console.log('client has been requested to reconnect');
//         break;
//       case Status.Update:
//         console.log(`client received a cluster update - ${s.data}`);
//         break;
//       case Status.Reconnect:
//         console.log(`client reconnected - ${s.data}`);
//         break;
//       case Status.Error:
//         console.log('client got a permissions error');
//         break;
//       case DebugEvents.Reconnecting:
//         console.log('client is attempting to reconnect');
//         break;
//       case DebugEvents.StaleConnection:
//         console.log('client has a stale connection');
//         break;
//       default:
//         console.log(`got an unknown status ${s.type}`);
//     }
//   }
// })().then();
