'use strict';
import fs from 'fs-extra';
import path from 'path';

const basename = path.basename(__filename);
const helpers = {};

((async () => {
  let filenames;
  filenames = await fs.readdirSync(__dirname);
  filenames = filenames.filter(v => v.indexOf('.') !== 0 && v !== basename);
  for (const filename of filenames) {
    if (filename.slice(-3) !== '.js') { continue; }
    let filepath = path.join(__dirname, filename);
    let imported = await import(filepath);
    if (typeof imported !== 'undefined') {
      filename = filename.replace(/\.js$/, '');
      helpers[filename] = imported.default;
    }
  }
})());

export default helpers;
