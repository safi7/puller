require('dotenv').config();

const headless = !!+process.env.PUPPETEER_HEADLESS;
const userAgent =
  'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36';
const args = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--window-position=0,0',
  '--ignore-certifcate-errors',
  '--ignore-certifcate-errors-spki-list',
  `--user-agent="${userAgent}"`,
  `--window-size=1920,1080`,
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
  // `--proxy-server=http=localhost:8888;https=localhost:8888`,
  // '--proxy-bypass-list=<-loopback>'
];

const puppeteer = {
  headless,
  args,
  ignoreHTTPSErrors: true,
  dumpio: false
  // executablePath: '/usr/bin/google-chrome-stable'
  // executablePath: '/usr/bin/chrome'
  // executablePath: '/root/.nvm/versions/node/v8.16.0/lib/node_modules/puppeteer/.local-chromium/linux-662092'
  //
};

export default {
  puppeteer,
  userAgent,
};
