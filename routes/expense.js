const express = require('express');
const expenseController = require('../controllers/expense');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Routes for expense operations
router.get('/user', authenticate, expenseController.getExpensesByUser);
router.post('/', authenticate, expenseController.addExpense);
router.delete('/:id', authenticate, expenseController.deleteExpense);
//routes for downloading expenses
router.get('/download',authenticate,expenseController.downloadExpenses);
// Add the paginated fetch route
router.get('/expenses', expenseController.getExpenses);

module.exports = router;
