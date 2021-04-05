'use strict';

import _ from 'lodash';
import moment from 'moment-timezone';
import Sequelize from 'sequelize';
import SequelizeModel from 'sequelize/lib/model';
import SequelizeUniqueConstraintError from 'sequelize/lib/errors/validation/unique-constraint-error';
import helpers from '../../../lib/helpers';

SequelizeModel.upsert = async function (data) {
  try {
    await this.create(data);
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
          console.log('SequelizeModel.upsert', error.message);
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

/**
 * This is use when a model/table has _change table.
 * And simply model1.change(changes); will cause upsert + insert change
 * This method assume the incoming data value has change all the time.
 */
SequelizeModel.change = async function (data) {
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
      (acc, cur) => ({ ...acc, [cur]: data[cur] || null }),
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
      return null; // ignore
      console.log(
        '[SequelizeModel.change] fail to create fresh record',
        this.name,
        where,
        error.message
      );
      throw error;
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
        return null;
      default:
        throw error;
    }
  }
};

SequelizeModel.bulkChange = async function (data) {
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
      // logging: console.log,
      updateOnDuplicate: updates
    });
    await change_model.bulkCreate(data);

    return instances;
  } catch (error) {
    console.log('[SequelizeModel.bulkchange] fail', this.name, error.message.error.name);
  }
};
