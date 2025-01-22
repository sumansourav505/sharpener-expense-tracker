const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Forgotpassword = require('../models/forgotpassword');

// Forgot Password
const forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User does not exist', success: false });
        }

        const id = uuid.v4();
        await Forgotpassword.create({ id, userId: user.id, active: true });

        sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Fixed typo

        const msg = {
            to: email,
            from: process.env.SENDGRID_EMAIL,
            subject: 'Reset Your Password',
            html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
        };

        await sgMail.send(msg);
        return res.status(200).json({ message: 'Link to reset password sent to your email', success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// Reset Password
const resetpassword = async (req, res) => {
    try {
        const { id } = req.params;
        const forgotPasswordRequest = await Forgotpassword.findOne({ where: { id, active: true } });

        if (!forgotPasswordRequest) {
            return res.status(404).send('Invalid or expired reset link');
        }

        return res.status(200).send(`
            <html>
                <form action="/password/updatepassword/${id}" method="get">
                    <label for="newpassword">Enter New Password:</label>
                    <input name="newpassword" type="password" required />
                    <button>Reset Password</button>
                </form>
            </html>
        `);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong', success: false });
    }
};

// Update Password
const updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;

        const resetPasswordRequest = await Forgotpassword.findOne({ where: { id: resetpasswordid } });

        if (!resetPasswordRequest) {
            return res.status(404).json({ message: 'Invalid reset password request', success: false });
        }

        const user = await User.findOne({ where: { id: resetPasswordRequest.userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const hashedPassword = await bcrypt.hash(newpassword, 10);
        await user.update({ password: hashedPassword });

        await resetPasswordRequest.update({ active: false });

        return res.status(201).json({ message: 'Password updated successfully', success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update password', success: false });
    }
};

module.exports = {
    forgotpassword,
    resetpassword,
    updatepassword,
};
