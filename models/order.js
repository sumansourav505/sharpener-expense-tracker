const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    paymentId: Sequelize.STRING,
    orderId: Sequelize.STRING, // Changed to camelCase
    status: Sequelize.STRING,
});

module.exports = Order;
