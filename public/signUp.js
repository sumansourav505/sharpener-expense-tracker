const signupForm = document.getElementById('signupForm');

const BASE_URL = 'http://localhost:3000'; // Define base URL

signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('mail').value.trim();
    const password = document.getElementById('pwd').value.trim();

    if (!name || !email || !password) {
        alert('Please fill all the fields.');
        return;
    }

    const userData = { name, email, password };

    try {
        const response = await axios.post(`${BASE_URL}/user/signup`, userData);

        alert('Sign-up successful!');
        signupForm.reset();
        window.location.href = '/login';
    } catch (error) {
        console.error('Error:', error);

        if (error.response && error.response.data && error.response.data.message) {
            alert(`Sign-up failed: ${error.response.data.message}`);
        } else {
            alert('An error occurred. Please try again.');
        }
    }
});
