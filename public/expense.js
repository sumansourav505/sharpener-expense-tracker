// Base URL for API
const BASE_URL = 'http://localhost:3000';

let currentPage=1;
const ITEMS_PER_PAGE=5;//limit:5 items/page

document.addEventListener('DOMContentLoaded', () => {
    displayExpenses(currentPage);
    checkPremiumStatus(); // Check and update the premium button visibility

    // Event listeners
    document.getElementById('addExpense').addEventListener('click', addExpense);
    document.getElementById('premiumButton').addEventListener('click', razoPay);
    document.getElementById('download-btn').addEventListener('click', download);
    document.getElementById('prevPage').addEventListener('click',()=>changePage(-1));
    document.getElementById('nextPage').addEventListener('click',()=>changePage(1));

    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'leadershipButton') {
            showLeadershipBoard();
        }
    });
});

// Add a new expense
async function addExpense() {
    const amount = document.getElementById('expenseAmount').value.trim();
    const description = document.getElementById('expenseDescription').value.trim();
    const category = document.getElementById('expenseCategory').value.trim();

    if (!amount || !description || !category) {
        alert("Please fill all fields!");
        return;
    }

    const expense = { amount, description, category };

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${BASE_URL}/expense`, expense, {
            headers: { Authorization: `Bearer ${token}` },
        });
        displayExpense(response.data);
        clearFields();
    } catch (error) {
        console.error('Error adding expense:', error.message);
        alert('Failed to add expense.');
    }
}

// Fetch and display expenses with pagination
async function displayExpenses(page) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Authorization token not found');
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/expense/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, limit: ITEMS_PER_PAGE },
        });

        console.log('API Response:', response.data);

        const{ expenses, currentPage, hasNextPage, hasPreviousPage, totalPages } = response.data;
        console.log(expenses);

        // if (!expenses || !Array.isArray(expenses)) {
        //     console.error('Invalid response format:', response.data);
        //     alert('Failed to load expenses. Please try again later.');
        //     return;
        // }

        const expenseList = document.getElementById('expenseList');
        expenseList.innerHTML = ''; // Clear the list

        if (expenses.length === 0) {
            const noExpensesMessage = document.createElement('p');
            noExpensesMessage.textContent = 'No expenses found.';
            expenseList.appendChild(noExpensesMessage);
        } else {
            expenses.forEach((expense) => displayExpense(expense));
        }
        // Update pagination  dynamically controls
        document.getElementById('currentPage').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevPage').disabled =!hasPreviousPage;
        document.getElementById('nextPage').disabled = !hasNextPage;
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        alert('Failed to fetch expenses. Please refresh the page.');
    }
}

// Change the page
function changePage(step) {
    currentPage += step;
    displayExpenses(currentPage);
}

// Display a single expense
function displayExpense(expense) {
    const expenseList = document.getElementById('expenseList');
    const expenseItem = document.createElement('div');
    expenseItem.className =
        'alert alert-secondary d-flex justify-content-between align-items-center';
    expenseItem.innerHTML = `
        <span>${expense.category}: ${expense.description} - ₹${parseFloat(expense.amount).toFixed(2)}</span>
        <div>
            <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>
        </div>
    `;
    expenseList.appendChild(expenseItem);
}

// Clear form fields
function clearFields() {
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseCategory').value = '';
}

// Delete an expense
async function deleteExpense(id) {
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`${BASE_URL}/expense/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        alert('Expense deleted successfully!');
        displayExpenses();
    } catch (error) {
        console.error('Error deleting expense:', error.message);
        alert('Failed to delete expense.');
    }
}

// Check if the user is a premium user and update UI
async function checkPremiumStatus() {
    const premiumButton = document.getElementById('premiumButton');
    let premiumContainer = document.getElementById('premiumMessageContainer');

    if (!premiumContainer) {
        premiumContainer = document.createElement('div');
        premiumContainer.id = 'premiumMessageContainer';
        document.body.appendChild(premiumContainer);
    }

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Authorization token not found.');
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/user/status`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.isPremiumUser) {
            premiumButton.style.display = 'none'; // Hide the premium button

            // Show the download button for premium users
            const downloadButton = document.getElementById('download-btn');
            if (downloadButton) {
                downloadButton.style.display = 'block'; // Ensure it's shown
            }

            if (!document.getElementById('leadershipButton')) {
                const leadershipButton = document.createElement('button');
                leadershipButton.id = 'leadershipButton';
                leadershipButton.textContent = 'Leadership';
                leadershipButton.classList.add('btn', 'btn-info');
                document.body.appendChild(leadershipButton);
            }

            let premiumMessage = document.querySelector('.premium-message');
            if (!premiumMessage) {
                premiumMessage = document.createElement('p');
                premiumMessage.textContent = 'You are a premium user🤴';
                premiumMessage.classList.add('premium-message');
                premiumContainer.appendChild(premiumMessage);
            }
        } else {
            premiumButton.style.display = 'block'; // Show the premium button for non-premium users

            const leadershipButton = document.getElementById('leadershipButton');
            const downloadButton = document.getElementById('download-btn');
            if (leadershipButton) {
                leadershipButton.remove();
            }
            if (downloadButton) {
                downloadButton.style.display = 'none'; // Hide the download button for non-premium users
            }

            const premiumMessage = document.querySelector('.premium-message');
            if (premiumMessage) {
                premiumMessage.remove();
            }
        }
    } catch (error) {
        console.error('Error fetching premium status:', error.message);
        alert('Failed to fetch user status. Please refresh the page.');
    }
}


// Show leadership board
async function showLeadershipBoard() {
    const leadershipElement = document.getElementById('leadership');
    leadershipElement.style.display = 'block';
    leadershipElement.innerHTML = '<h1 class="text-center">Leaders Board</h1>';

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Authorization token not found');
        alert('Please log in to view the leadership board.');
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/premium/show-leadership`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        response.data.forEach((userDetails) => {
            const listItem = document.createElement('li');
            listItem.className = 'alert alert-secondary d-flex justify-content-between align-items-center';
            listItem.textContent = `Name: ${userDetails.name} - Total Expense: ₹${userDetails.totalExpenses}`;
            leadershipElement.appendChild(listItem);
            
        });
    } catch (error) {
        console.error('Error fetching leadership data:', error.message);
        alert('Failed to fetch leadership board.');
    }
}

// Download expenses
async function download() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Authorization token not found');
        alert('Please log in to download expenses.');
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/expense/download`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 201) {
            const a = document.createElement('a');
            a.href = response.data.fileUrl;
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message || 'Unexpected error occurred');
        }
    } catch (error) {
        console.error('Error downloading expenses:', error.message);
        alert('Failed to download expenses. Please try again later.');
    }
}

// Razorpay integration for premium membership
async function razoPay() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Authorization token not found');
        alert('Please log in to proceed');
        return;
    }

    try {
        const response = await axios.post(`${BASE_URL}/purchase/premium-membership`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const { order, keyId } = response.data;
        if (!order || !order.id || !keyId) {
            throw new Error('Invalid response from server during Razorpay integration.');
        }

        var options = {
            key: keyId,
            order_id: order.id,
            handler: async function (response) {
                try {
                    await axios.post(
                        `${BASE_URL}/purchase/updateTransactionStatus`,
                        {
                            order_id: options.order_id,
                            payment_id: response.razorpay_payment_id,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    alert('You are a premium user now');
                    checkPremiumStatus();
                } catch (err) {
                    console.error('Error updating transaction status:', err);
                    alert('Transaction failed!');
                }
            },
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Error initiating Razorpay:', error.message);
        alert('Failed to initiate payment.');
    }
}
