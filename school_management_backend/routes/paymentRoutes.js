const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = 'https://api.paystack.co';

// Initialize a payment
router.post('/initialize', verifyToken, async (req, res) => {
  const { email, amount, studentId, feeId, paymentType } = req.body;

  if (!email || !amount || !studentId) {
    return res.status(400).json({ error: 'email, amount, and studentId are required' });
  }

  try {
    const paystackRes = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // Naira -> kobo
        metadata: { studentId, feeId, paymentType: paymentType || 'school_fees' },
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const { reference, authorization_url } = paystackRes.data.data;

    // receipt_no doubles as the Paystack reference here
    await db.query(
      `INSERT INTO payments 
        (student_id, fee_id, amount_paid, date_paid, receipt_no, recorded_by, status, payment_type)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
      [studentId, feeId || null, amount, reference, req.user.id, 'pending', paymentType || 'school_fees']
    );

    res.json({
      authorization_url, reference
    });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to initialize payment'
    });
  }
});

// Verify a payment
router.get('/verify/:reference', verifyToken, async (req, res) => {
  const { reference } = req.params;

  try {
    const paystackRes = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const { status, amount, metadata } = paystackRes.data.data;
    const newStatus = status === 'success' ? 'success' : 'failed';

    await db.query(
      'UPDATE payments SET status = ?, paystack_response = ? WHERE receipt_no = ?',
      [newStatus, JSON.stringify(paystackRes.data.data), reference]
    );

    res.json({
      status: newStatus,
      amount: amount / 100,
      studentId: metadata?.studentId
    });
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to verify payment'
    });
  }
});

// Payment history for a student
router.get('/history/:studentId', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, fee_id, amount_paid, date_paid, receipt_no, status, payment_type, created_at 
       FROM payments WHERE student_id = ? ORDER BY created_at DESC`,
      [req.params.studentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch payment history'
    });
  }
});

// Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(req.body)
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);

  if (event.event === 'charge.success') {
    const { reference } = event.data;
    await db.query(
      'UPDATE payments SET status = ?, paystack_response = ? WHERE receipt_no = ?',
      ['success', JSON.stringify(event.data), reference]
    );
  }

  res.sendStatus(200);
});

module.exports = router;