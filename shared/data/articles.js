import _ from 'lodash';
import articledb from '../models/mysql/articles-bursa';

export default new (class MiscController {
  constructor() { }


  async insertOne(data) {
    const model = articledb['bursa_articles'];
    const one = await model.upsert(data);
    console.log('[IN1]');
    return one;
  }

  async insertError(err) {
    console.log('insertError', err);
    const model = articledb['errors'];
    return await model.create(err);

  }
})();
