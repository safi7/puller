import _ from 'lodash';
import moment from 'moment-timezone';
import Sequelize from 'sequelize';
import QueueCreateQuery from './queue-create.js';
import QueueUpsertQuery from './queue-upsert.js';

import SequelizeUniqueConstraintError from 'sequelize/lib/errors/validation/unique-constraint-error.js';

const { Model } = Sequelize;

export default class BaseModel extends Model {
  static init(attributes, options) {
    const model = super.init(attributes, options);

    model.queueCreateQuery = new QueueCreateQuery(model);
    model.queueUpsertQuery = new QueueUpsertQuery(model);

    model.bufferCreate = (data, options = null) => {
      model.queueCreateQuery.queueIn(data, options);
    };

    model.bufferUpsert = (data, options = null) => {
      model.queueUpsertQuery.queueIn(data, options);
    };
    model.bufferBulkCreate = (data, options = null) => {
      model.queueBulkCreateQuery.queueIn(data, options);
    };
    model.bufferBulkChange = (data, options = null) => {
      model.queueBulkChangeQuery.queueIn(data, options);
    };

    model.upsert = async function (data) {
      try {
        const result = await this.create(data);

        return result;
      } catch (error) {
        switch (true) {
          case error instanceof SequelizeUniqueConstraintError:
            const where = {};
            // error.errors[0].path may(depend on mysql version/configuration?) return table_name.index_name
            // but we only expect index_name
            const path = error.errors[0].path.split('.').pop();
            const uniques = path.split('+');
            try {
              for (const unique of uniques) {
                where[unique] = data[unique];
              }
              return await this.update(data, { where });
            } catch (error) {
              console.log('SequelizeModel.upsert', this.name, error.message);
              // console.log('data', data);
              // console.log('where', where);
              // console.log('uniques', uniques);
              throw error;
            }
          default:
            console.log('ERR.SequelizeModel.upsert', this.name, error.message, error.name);
            throw error;
        }
      }
    };

    model.change = async function (data) {
      const index = this.options.indexes.filter(
        v => v.unique && v.type === 'change'
      );
      const excludes = ['id', 'created_at', 'updated_at', 'deleted_at'];
      data = _.omit(data, excludes);

      if (!index.length) {
        console.log(
          '[SequelizeModel.change] change index not found in model',
          this.name
        );
        throw new Error('[SequelizeModel.change] change index not found in model');
      }

      const change_model = this.sequelize.models[`${this.name}_change`];
      let where = {},
        instance = null;
      try {
        // get the conditions and find is target instance exist
        where = index[0].fields.reduce(
          (acc, cur) => ({ ...acc, [cur]: !(cur in data) ? null : data[cur] }),
          {}
        );
        instance = await this.findOne({ where });
      } catch (error) {
        console.log(
          '[SequelizeModel.change] fail to run fineOne+where',
          this.name,
          where,
          data
        );
        console.log(error.message, error.name);
        throw error;
      }

      if (!instance) {
        try {
          // fresh record
          instance = await this.create(data);
          await change_model.create(instance.toJSON());
          // await change_model.create(instance);
          return instance;
        } catch (error) {
          console.log('ERR: model.change():', error, { index, where, instance, this: this });
          return null; // ignore
        }
      }

      try {
        const result = await this.update(
          { ..._.omit(data, index[0].fields), updated_at: moment().format() },
          { where }
        );
        let [affected, instances] = result;
        if (affected) {
          instances = instances.map(v => {
            v = v.toJSON();
            return _.omit(v, excludes);
          });
          await change_model.bulkCreate(instances);
        }
        return instances;
      } catch (error) {
        console.log(
          '[SequelizeModel.change] fail to update record',
          this.name,
          _.omit(data, index[0].fields),
          where,
          error
        );
        switch (true) {
          case error instanceof SequelizeUniqueConstraintError:
            await helpers.logger.e(error, {
              at: 'E.SequelizeModel.change.create.SequelizeUniqueConstraintError.1',
              data
            });
            console.log('ERR SequelizeUniqueConstraintError: model.change():', error);
            return null;
          default:
            throw error;
        }
      }
    };

    model.bulkChange = async function (data, options) {
      const index = this.options.indexes.filter(
        v => v.unique && v.type === 'change'
      );

      if (!index.length) {
        console.log(
          '[SequelizeModel.change] change index not found in model',
          this.name
        );
        throw new Error('[SequelizeModel.change] change index not found in model');
      }

      const indexes = this.options.indexes[0].fields;
      const attributes = Object.keys(this.rawAttributes);
      const excludes = ['id', 'created_at', 'deleted_at'];
      const updates = _.difference(attributes, [...excludes, ...indexes]);
      const change_model = this.sequelize.models[`${this.name}_change`];
      let instances = [];

      try {
        instances = await this.bulkCreate(data, {
          indexes,
          updateOnDuplicate: updates
        });
        await change_model.bulkCreate(data);
        return instances;
      } catch (error) {
        console.log('[SequelizeModel.bulkchange] fail', error.message, error.name, this.name);
      }
    };

    return model;
  }
}