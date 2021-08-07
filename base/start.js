import _ from 'lodash';
import moment from 'moment-timezone';
import { timer } from 'rxjs';
import puppeteer from 'puppeteer-extra';
import config from '../config';
import fetchArticles from '../app/runnables/fetch-articles';
import articleM from '../shared/data/articles';
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
var browser;
var f12;
var every_x_s;

async function start() {
  await new Promise(async (resolve, reject) => {
    try {

      if (every_x_s) { every_x_s.unsubscribe }

      every_x_s = timer(0, 1000 * 60 * 30).subscribe(async (counter) => {
        if (counter * 30 > 2 * 60) {
          browser.close();
        }
        if (counter === 0 || (counter * 30 * 60 * 1000 % config.every_xms) === 0) {
          const page = await initialize();
          console.log('initialized');
          await fetchArticles(page, f12, counter);
        }
      })

    } catch (err) {
      console.log('error!!!!!!!! @base');
      await articleM.insertError({ data: err.message, message: 'error-at-base-level' })
    }
  })
}


async function initialize() {
  console.log(`[] initialize();`);
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const pages = await browser.newPage();
  return await preparePage(pages);
}


async function preparePage(page) {
  // prevent detect, should put after an url executed
  f12 = await page.target().createCDPSession();
  await f12.send("Network.enable");
  await f12.send("Page.enable");

  await page.setViewport({ width: 1600, height: 900 });
  await page.setUserAgent(config.puppeteer.userAgent);
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  });

  console.log(`[] Prepare page`);
  return page;
}

export default { start }