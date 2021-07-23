import _ from "lodash";
import config from "../../config";
import { timer } from "rxjs";
import moment from "moment-timezone";
import articleHelper from '../helpers/articles';
import articleM from "../../shared/data/articles";
import delay from 'delay';
async function fetchArticles(page) {
  console.log(`------------- fetchArticles ------------`);
  // console.log(`[] config`, config);

  return new Promise(async (resolve, reject) => {
    try {
      console.log(`> Starting to crawl Articles`);
      let url_to_go = config.main_url.root;
      console.log(`> ${url_to_go}`);

      await page.goto(url_to_go, { timeout: 60000, waitUntil: ["networkidle0", "networkidle2"] }); // go to website

      timer(0, config.every_xms).subscribe(async (counter) => {
        // every 3 hours to run and look for new articles
        // we can change this by going to setup file and change every_xms value
        try {
          const required_url = prepareUrl(url_to_go);
          const data = await xhr(page, required_url);
          console.log(' ------------RECEIVED---------------- ');

          const formated = formatArticles(data)
          console.log(`------------ FORMSTED ${formated.length} ----------------`);
          await storeArticles(formated);
          console.log({ counter });
          console.log(' ------------DONE---------------- ',);
        } catch (err) {
          console.log(' ------------err---------------- ', err.message);
          await articleM.insertError({ data: err.message, message: 'error-at-xhr-fetching-level' })
        }
      })
    } catch (err) {
      console.log(' ------------err---------------- ', err.message);
      await articleM.insertError({ data: err.message, message: 'error-at-opening-level' })
      await delay(1000 * 60 * 60);
      fetchArticles(page);
    }


  });
}


async function xhr(page, url) {
  console.log(' ---------------------------- ',);
  // console.log({ url });
  console.log(' ---------------------------- ');

  // run javascript fetch function to get articles for specific date and keyword
  return await page.evaluate((_url) => {
    try {
      return new Promise((resolve, reject) => {
        try {
          fetch(_url).then(function (response) {
            return resolve(response.text());
          })
            .catch(error => {
              reject(error.message);
            });
          // resolve('can liao: ' + _url);
        } catch (error) {
          reject(error.message);
        }
      });
    } catch (error) {
      reject(error.message);
    }
  }, url);
}

function formatArticles(data) {
  console.log('> formating ...');

  let info = articleHelper.getTables(data); // take all tables
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

async function storeArticles(data) {
  for (let each of data) {
    if (articleHelper.ensure(each)) {
      await articleM.insertOne(each);
    } else {
      await articleM.insertError({ data: JSON.stringify(each), message: 'incomplete-data-received' });
    }
  }
  console.log(' ------------STORED---------------- ', data);
  return;
}


function prepareUrl(url) {
  url = (`${url}?keyword=private+placement`); // this usrl to fetch all
  // url = (`${url}?keyword=private+placement&dt_ht=${moment().format('DD/MM/YYYY')}`); // here we fetch only for today
  return url;
}


export default fetchArticles;