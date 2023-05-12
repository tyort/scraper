/* eslint-disable indent */
import pkg from 'nats';
const { connect, Empty, StringCodec } = pkg;

const STREAM_NAME = 'encarStream';
const SUBJECT = 'encarStream.*';

const nc = await connect({
  name: 'tyort-connection',
  verbose: true,
  // reconnect: false,
  reconnectTimeWait: 10 * 1000,
  maxReconnectAttempts: 10,
  // pingInterval: 20 * 1000,
  servers: [
    `${process.env.NATS_SERVER_HOST}:${process.env.NATS_SERVER_PORT}`,
    `${process.env.NATS_SERVER_HOST}:4223`,
  ],
  // token: process.env.TOKEN,
  // debug: true,
});

const sc = StringCodec();
const jsm = await nc.jetstreamManager();

// list all the streams, the `next()` function
// retrieves a paged result.
const streams = await jsm.streams.list().next();
streams.forEach((si) => {
  console.log(si);
});

await jsm.streams.add({ name: STREAM_NAME, subjects: [SUBJECT] });

// publish a reg nats message directly to the stream
nc.publish(`${SUBJECT}`, sc.encode('world'));

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
