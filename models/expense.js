const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('expense', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category:{
    type:Sequelize.STRING,
    allowNull:false
  },
  
});

module.exports = Expense;
