const axios = require('axios');
const Order = require('../models/order');

const purchasePremium = async (req, res) => {
    try {
        console.log("Premium");
        const keyId = process.env.RAZORPAY_KEY_ID;  //  Razorpay Key ID
        const secretKey = process.env.RAZORPAY_KEY_SECRET;  //  Razorpay Secret Key
        const amount = 2500; // Amount in INR

        // Check if there's already a pending order
        // const existingOrder = await req.user.getOrders({ where: { status: 'PENDING' } });
        // if (existingOrder.length > 0) {
        //     return res.status(400).json({ message: 'A pending order already exists.' });
        // }

        // Prepare payload for Razorpay order creation
        const orderData = {
            amount: amount * 100,  // Convert to paise (1 INR = 100 paise)
            currency: 'INR',
            receipt: `order_${req.user.id}_${Date.now()}`,
            payment_capture: 1  // Automatic payment capture after successful transaction
        };

        // Call Razorpay API to create an order
        const razorpayOrder = await axios.post(
            'https://api.razorpay.com/v1/orders',
            orderData,
            {
                auth: {
                    username: keyId,
                    password: secretKey
                }
            }
        );

        if (razorpayOrder.status === 200) {
            // Save the order in the database
            const newOrder = await req.user.createOrder({
                orderId: razorpayOrder.data.id,
                status: 'PENDING',
            });

            // Respond with order details and Razorpay order ID
            return res.status(201).json({
                order: razorpayOrder.data,
                keyId: keyId,  // Send Razorpay Key ID to frontend for payment UI
            });
        } else {
            console.log("fail to create order");
             res.status(400).json({ message: 'Failed to create order.' });

        }
    } catch (err) {
        console.error('Error in purchasePremium:', err.message);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};


const updateTransactionStatus = async (req, res) => {
    try {
        const { order_id, payment_id } = req.body;

        const order = await Order.findOne({ where: { orderId: order_id } });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status === 'SUCCESS') {
            return res.status(400).json({ message: 'Order already marked as successful.' });
        }

        // Verify the payment with Razorpay
        const razorpayOrder = await axios.get(
            `https://api.razorpay.com/v1/orders/${order_id}`,
            {
                auth: {
                    username: 'rzp_test_AEhpQC3stcSTVw',  // Razorpay Key ID
                    password: 'jpxAl4mZd3s7gaNhseOUAB0R' // Razorpay Secret Key
                }
            }
        );

        if (razorpayOrder.data.status === 'paid') {
            // Update order status to 'SUCCESS'
            order.paymentId = payment_id;
            order.status = 'SUCCESS';
            await order.save();

            // Update user to premium
            const user=req.user;
            await req.user.update({ isPremiumUser: true });

            res.status(200).json({ message: 'Transaction status updated successfully' });
        } else {
            order.status = 'FAILED';
            await order.save();

            res.status(400).json({ message: 'Transaction failed. Please try again.' });
        }
    } catch (err) {
        console.error('Error in updateTransactionStatus:', err.message);
        res.status(500).json({ error: 'Failed to update transaction status.' });
    }
};

const getUserStatus = async (req, res) => {
    try {
        const user = req.user; // Assuming user is attached by authentication middleware
        res.status(200).json({ isPremiumUser: user.isPremiumUser });
    } catch (err) {
        console.error('Error fetching user status:', err.message);
        res.status(500).json({ error: 'Failed to fetch user status.' });
    }
};

module.exports = { purchasePremium, updateTransactionStatus, getUserStatus };
