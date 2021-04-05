import _ from 'lodash';
import moment from 'moment-timezone';
import { timer } from 'rxjs';
import puppeteer from 'puppeteer';
import config from '../config';
import fetchArticles from '../app/runnables/fetch-articles';
import articleM from '../shared/data/articles';

var browser;

async function start() {

  try {
    const page = await initialize();
    console.log('initialized');
    await fetchArticles(page);
  } catch (err) {
    console.log('error!!!!!!!! @base');
    await articleM.insertError({ data: err.message, message: 'error-at-base-level' })
  }
}


async function initialize() {
  console.log(`[] initialize();`);
  browser = await puppeteer.launch(config.puppeteer.launch);
  const pages = await browser.pages();
  return await preparePage(pages[0]);
}


async function preparePage(page) {
  // prevent detect, should put after an url executed
  await page.setViewport({ width: 1600, height: 900 });
  await page.setUserAgent(config.puppeteer.userAgent);
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  });

  console.log(`[] Prepare page`);
  return page;
}

export default { start }