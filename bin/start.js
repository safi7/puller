import delay from 'delay';
import config from "../setup";
import kill from "kill-port";
import base from '../base/start';
import articleM from '../shared/data/articles';

main().catch(error);

async function main() {
  require("events").EventEmitter.defaultMaxListeners = 0;

  console.log(`✡ Starting Bursa Puller ✡`);

  await delay(1000);

  process.on("uncaughtException", error);
  process.on("unhandledRejection", error);

  await base.start(); // hold until die
}

async function error(error) {
  console.log("error! @@@Bin");
  switch (error.errno) {
    case "EADDRINUSE":
      console.log(`EADDRINUSE: PORT in use`);
      break;
    default:
      await articleM.insertError({ data: JSON.stringify(error.message), message: 'error-at-bin-level' })
      await base.start(); // hold until die
      console.log('error.message', error.message);
  }
}