import moment from 'moment-timezone';

require('dotenv').config();

moment.tz.setDefault('UTC');
moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';
moment.defaultFormatUtc = 'YYYY-MM-DD HH:mm:ss';

const headless = !!+process.env.PUPPETEER_HEADLESS;
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';
const args = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--window-position=0,0',
  '--ignore-certifcate-errors',
  '--ignore-certifcate-errors-spki-list',
  `--user-agent="${userAgent}"`,
  `--window-size=900,600`,
  `--start-maximized`,
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-client-side-phishing-detection',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-hang-monitor',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-sync',
  '--disable-translate',
  '--metrics-recording-only',
  '--no-first-run',
  '--remote-debugging-port=0',
  '--safebrowsing-disable-auto-update',
  '--enable-automation',
  '--password-store=basic',
  '--use-mock-keychain',
  '--disable-gpu',
  '--hide-scrollbars',
  '--mute-audio'
];

const puppeteer = {
  headless,
  userAgent,
  launch: {
    headless,
    args,
    ignoreHTTPSErrors: true,
    dumpio: false
  },
};


export default {
  every_xms: 8, // hours
  puppeteer,
  base_url: {
    root: "https://www.bursamalaysia.com",
  },
  main_url: {
    root: "https://www.bursamalaysia.com/market_information/announcements/company_announcement",
  },

  mysql_name: process.env.DB_MYSQL_NAME,
  mysql_host: process.env.DB_MYSQL_HOST,
  mysql_port: +process.env.DB_MYSQL_PORT,
  mysql_user: process.env.DB_MYSQL_USERNAME,
  mysql_pass: process.env.DB_MYSQL_PASSWORD,
};