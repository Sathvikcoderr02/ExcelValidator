const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Record = sequelize.define('Record', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    sheetName: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['sheetName']
        },
        {
            fields: ['date']
        }
    ]
});

module.exports = Record;
