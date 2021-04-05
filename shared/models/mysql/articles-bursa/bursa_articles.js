import Sequelize from 'sequelize';
import BaseModel from '../base.js';

class BursalArticles extends BaseModel {
  static init(sequelize) {
    const { DataTypes } = Sequelize;
    return super.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        articale_id: { type: DataTypes.INTEGER, autoIncrement: true },
        company_name: DataTypes.STRING,
        company_profile: DataTypes.STRING,
        title: DataTypes.STRING,
        url: DataTypes.STRING,
        publish_at: DataTypes.STRING,
        created_at: DataTypes.STRING,
        updated_at: DataTypes.STRING
      },
      {
        modelName: 'bursa_articles',
        tableName: 't01_bursa_articles',
        timestamps: false,
        indexes: [
          { unique: true, fields: ['url'], type: 'upsert' }
        ],
        sequelize
      }
    );
  }
}

export default BursalArticles;
