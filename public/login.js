const loginForm = document.getElementById('loginForm');
const signupButton = document.getElementById('signupButton');
const forgotPasswordButton = document.getElementById('forgotPasswordButton');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const BASE_URL = 'http://localhost:3000'; // Backend server base URL

// Handle login submission
loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('mail').value.trim();
    const password = document.getElementById('pwd').value.trim();

    if (!email || !password) {
        alert('Please fill all the fields.');
        return;
    }

    const loginData = { email, password };
    const loginButton = event.submitter;

    try {
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        const response = await axios.post(`${BASE_URL}/user/login`, loginData);
        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);

            alert('Login successful!');
            loginForm.reset();
            window.location.href = '/'; // Redirect to the expense page
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.response?.data?.message || 'An error occurred during login.');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});

// Redirect to signup page
signupButton.addEventListener('click', () => {
    window.location.href = '/signup'; // Signup page route
});

// Show forgot password form
forgotPasswordButton.addEventListener('click', () => {
    forgotPasswordForm.style.display = 'block';
});

// Handle forgot password submission
forgotPasswordForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('forgotEmail').value.trim();
    if (!email) {
        alert('Please enter your email.');
        return;
    }

    try {
        const response = await axios.post(`${BASE_URL}/password/forgotpassword`, { email }, {
            
        });

        alert(response.data.message || 'If the email is registered, you will receive password reset instructions.');
        forgotPasswordForm.reset();
        forgotPasswordForm.style.display = 'none';
    } catch (error) {
        console.error('Error during password reset:', error);
        alert(error.response?.data?.message || 'An error occurred. Please try again.');
    }
});
