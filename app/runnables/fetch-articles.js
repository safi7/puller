import _ from "lodash";
import config from "../../config";
import { async, timer } from "rxjs";
import moment from "moment-timezone";
import articleHelper from '../helpers/articles';
import articleM from "../../shared/data/articles";
import delay from 'delay';
import fs from 'fs-extra';
var total_pages = 1;
var page;
let counter = 0;
async function fetchArticles(newPage, f12, c_counter = 0) {
  console.log({ c_counter });
  page = newPage;
  counter = c_counter;
  total_pages = 1;
  console.log(`------------- fetchArticles ------------`);
  // console.log(`[] config`, config);

  return new Promise(async (resolve, reject) => {
    try {
      console.log(`> Starting to crawl Articles`);
      let url_to_go = config.main_url.root;
      console.log(`> ${url_to_go}`);

      f12.on("Network.responseReceived", async (event) => {
        const { requestId, response } = event;
        const { url } = response;
        let body;

        switch (true) {
          case url.includes('/market_information/announcements/company_announcement'):
            body = await fetchBody(requestId, f12);
            handleData(body);
            break;
        }
      });
      url_to_go = prepareUrl(url_to_go, 0);
      await page.goto(url_to_go, { timeout: 60000, waitUntil: ["networkidle0", "networkidle2"] }); // go to website
    } catch (err) {
      console.log(' ------------err---------------- ', err.message);
      await articleM.insertError({ data: err.message, message: 'error-at-opening-level' })
      fetchAllPages(page, f12, counter);
    }


  });
}

async function fetchBody(requestId, f12) {
  try {
    await page.waitFor(2000);
    const response = await f12.send("Network.getResponseBody", {
      requestId,
    });
    return response.body;
  } catch (error) {
    console.log("ERR.Network.getResponseBody.skip", error.message);
    return null;
  }
}

async function handleData(data) {
  try {
    if (!data) { return; }
    const formated = formatArticles(data)
    console.log(`------------ FORMSTED ${formated.length} ----------------`);
    await storeArticles(formated);
    console.log(' ------------DONE---------------- ',);
    formatPagination(data);
  } catch (err) {
    console.log(' ------------err---------------- ', err.message);
    await articleM.insertError({ data: err.message, message: 'error-at-xhr-fetching-level' })
  }
}


function formatArticles(data) {
  console.log('> formating ...');
  let info = articleHelper.getTables(_.cloneDeep(data)); // take all tables
  info = articleHelper.getAnnouncementTable(info); // drop useless tables, take announcements table
  info = articleHelper.getTableBody(info); // get table bodypart, drop head
  info = articleHelper.getTableRow(info); // split each row

  const rows = [];
  for (let each of info) {
    if (each.includes('<td')) {
      each = articleHelper.getTableTd(each); // split each cell for each row
      rows.push(each);
    }
  }

  const formated = [];
  for (let row of rows) {
    formated.push({
      publish_at: articleHelper.getPublishDate(row[1]),
      company_name: articleHelper.getArticleText(row[2]),
      company_profile: config.base_url.root + articleHelper.getUrl(row[2]),
      url: config.base_url.root + articleHelper.getUrl(row[3]),
      title: articleHelper.getArticleText(row[3]),
    })
  }
  return formated;
}

function formatPagination(data) {
  let info = _.cloneDeep(data);
  if (total_pages > 1) {
    return;
  }
  info = articleHelper.getPagination(info);
  info = articleHelper.getPaginateLi(info);
  info = articleHelper.getTotalPages(info);
  info = articleHelper.getTotalPagesValue(info);
  if (info) {
    total_pages = info;
    fetchAllPages()
  }
}

async function storeArticles(data) {
  for (let each of data) {
    if (articleHelper.ensure(each)) {
      await articleM.insertOne(each);
    } else {
      await articleM.insertError({ data: JSON.stringify(each), message: 'incomplete-data-received' });
    }
  }
  console.log(' ------------STORED---------------- ', data.length);
  return;
}


async function fetchAllPages() {
  for (let p_num = 2; p_num < total_pages; p_num++) {
    let url_to_go = prepareUrl(config.main_url.root, p_num);
    await page.goto(url_to_go, { timeout: 60000, waitUntil: ["networkidle0", "networkidle2"] }); // go to website
    await delay(2000);
  }
}

function prepareUrl(url, p_num) {
  url = (`${url}?keyword=private+placement`);
  if (counter > 0) {
    url = (`${url}&dt_ht=${moment().format('DD/MM/YYYY')}`); // here we fetch only for today
  }
  if (p_num) {
    url = (`${url}&page=${p_num}`); // here we fetch only for today
  }
  console.log({ url })
  return url;
}


export default fetchArticles;