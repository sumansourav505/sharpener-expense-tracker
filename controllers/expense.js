const Expense = require('../models/expense');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

// Get all expenses for a user
exports.getExpensesByUser = async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Failed to fetch expenses.' });
    }
};
exports.getExpenses = async (req, res) => {
    const page = parseInt(req.query.page); 
    const limit = parseInt(req.query.limit);
    try {
        const totalExpenses=await Expense.count();//total number of expenses
        const expenses=await Expense.findAll({
            where: { userId: req.user.id } ,
            offset:(page-1)*limit,
            limit:limit,
        });
        const totalPages=Math.ceil(totalExpenses/limit);

        const expenseData=expenses.map(expense=>expense.toJSON())

        console.log({expenses:expenseData,
            currentPage:page,
            hasNextPage:page<totalPages,
            hasPreviousPage:page>1,
            totalPages,});

        res.status(200).json({
            expenses:expenseData,
            currentPage:page,
            hasNextPage:page<totalPages,
            hasPreviousPage:page>1,
            totalPages,
        });
            
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};


// Add a new expense
exports.addExpense = async (req, res) => {
    const t = await sequelize.transaction({timeout:10000});
    const { description, amount, category } = req.body;

    if (!description || !amount || !category) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Add the expense
        const newExpense = await Expense.create(
            {
                description,
                amount,
                category,
                userId: req.user.id,
            },
            { transaction: t }
        );

        // Update the user's total expenses
        const updatedTotal = Number(req.user.totalExpenses || 0) + Number(amount);
        await User.update(
            { totalExpenses: updatedTotal },
            {
                where: { id: req.user.id },
                transaction: t, // Ensure the transaction is passed here
            }
        );

        await t.commit();
        return res.status(201).json(newExpense);
    } catch (error) {
        if (t) await t.rollback(); // Rollback if the transaction exists
        console.error('Error adding expense:', error);
        return res.status(500).json({ message: 'Failed to add expense.' });
    }
};

exports.downloadExpenses = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming `req.user` contains the authenticated user's details
        const expenses = await Expense.findAll({ where: { userId } });

        if (expenses.length === 0) {
            return res.status(404).json({ message: 'No expenses found for the user.' });
        }

        const expenseData = expenses.map(expense => ({
            id: expense.id,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
        }));

        // Create CSV data
        let csvContent = 'ID,Amount,Description,Category,Created At,Updated At\n';
        expenseData.forEach(expense => {
            csvContent += `${expense.id},${expense.amount},${expense.description},${expense.category},${expense.createdAt},${expense.updatedAt}\n`;
        });

        // Save the CSV file to a temporary location
        const filePath = path.join(__dirname, '..', 'downloads', `expenses-${userId}.csv`);
        fs.writeFileSync(filePath, csvContent);

        // Return file URL for download
        const fileUrl = `${req.protocol}://${req.get('host')}/downloads/expenses-${userId}.csv`;
        res.status(201).json({ fileUrl });
    } catch (error) {
        console.error('Error downloading expenses:', error);
        res.status(500).json({ message: 'Failed to generate expenses file.' });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        // Find the expense
        const expense = await Expense.findOne(
            { where: { id, userId: req.user.id } },
            { transaction: t }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or not authorized.' });
        }

        // Deduct the expense amount from the user's total expenses
        const updatedTotal = Number(req.user.totalExpenses || 0) - Number(expense.amount);
        await User.update(
            { totalExpenses: updatedTotal },
            {
                where: { id: req.user.id },
                transaction: t, // Ensure the transaction is passed here
            }
        );

        // Delete the expense
        await expense.destroy({ transaction: t });

        await t.commit();
        return res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        if (t) await t.rollback(); // Rollback if the transaction exists
        console.error('Error deleting expense:', error);
        return res.status(500).json({ message: 'Failed to delete expense.' });
    }
};
