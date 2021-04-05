import Queue from 'better-queue';

export default class QueueUpsertQuery {
  model;
  queue;

  constructor(model) {
    this.model = model;
    this.queue = new Queue(this.execute.bind(this), { batchDelay: 300, batchSize: 100 });
  }

  queueIn(data, options) {
    this.queue.push({ data, options }, () => { });
  }

  async execute(sets, cb) {
    try {
      const promises = sets.map(({ data, options }) => async () => {
        await this.model.upsert(data, options);
      });
      await Promise.all(promises.map(p => p()));
    } catch (error) {
      console.log('ERR.QueueUpsertQuery', error.message);
    }

    cb();
    // console.log('QueueUpsertQuery.executed', sets.length, this.model.name);

    return true;
  }
};