const {DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    isPremiumUser: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Default value is false
        allowNull: false,
    },
    totalExpenses:{
        type:Sequelize.INTEGER,
        default:0,
    }
    
});

module.exports = User;
