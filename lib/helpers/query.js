import helpers from './index';

export default new (class Query {
  constructor() {}

  async select(sql, sequelize) {
    let data, count, select, body, order, limit;

    data = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
    [select, body, order, limit] = helpers.common.splits(sql, [
      'FROM',
      'ORDER BY',
      'LIMIT'
    ]);
    sql = 'SELECT COUNT(*) AS `count` FROM ' + body;

    count = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
    count = count[0].count;

    return { data, count };
  }
})();
