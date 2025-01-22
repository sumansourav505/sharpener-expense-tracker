const  User = require('../models/user');


// Controller function for '/premium/show-leadership'
const showLeadership = async (req, res) => {
  try {
    // Fetch users and their total expenses, with a join between User and Expense tables
    const leadershipData = await User.findAll({
      attributes: ['id', 'name', 'totalExpenses'],
      order: [
        ['totalExpenses','DESC']],
    });
    // Send the data back to the client
    res.json(leadershipData);
  } catch (error) {
    console.error('Error fetching leadership data:', error);
    res.status(500).json({ error: 'An error occurred while fetching leadership data', details: error.message });
  }
};


module.exports = { showLeadership };
