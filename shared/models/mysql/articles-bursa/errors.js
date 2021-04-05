import Sequelize from 'sequelize';
import BaseModel from '../base.js';

class Errors extends BaseModel {
  static init(sequelize) {
    const { DataTypes } = Sequelize;
    return super.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        message: DataTypes.STRING,
        data: DataTypes.STRING,
        created_at: DataTypes.STRING,
      },
      {
        modelName: 'errors',
        tableName: 't10_error',
        timestamps: false,
        sequelize
      }
    );
  }
}

export default Errors;
