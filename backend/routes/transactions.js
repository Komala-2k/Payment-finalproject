const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Helper function to validate UPI ID
const validateUpiId = (upiId) => {
  return upiId && upiId.includes('@digitalwallet');
};

// Helper function to update user balances
const updateBalances = async (senderId, receiverId, amount, session) => {
  const [sender, receiver] = await Promise.all([
    User.findByIdAndUpdate(
      senderId,
      { $inc: { balance: -amount } },
      { new: true, session, runValidators: true }
    ),
    User.findByIdAndUpdate(
      receiverId,
      { $inc: { balance: amount } },
      { new: true, session, runValidators: true }
    )
  ]);

  if (!sender || !receiver) {
    throw new Error('User not found');
  }

  if (sender.balance < 0) {
    throw new Error('Insufficient balance');
  }

  return { sender, receiver };
};

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Transaction API is working!' });
});

// Get user's transaction history
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .sort({ timestamp: -1 })
    .limit(50)
    .populate('sender', 'name email')
    .populate('receiver', 'name email');

    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ balance: user.balance });
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add money to wallet
router.post('/add-money', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create transaction record
    const transaction = new Transaction({
      sender: req.user._id,
      receiver: req.user._id,
      amount,
      type: 'add_money',
      status: 'completed',
      description: 'Added money to wallet',
      transactionId: uuidv4(),
    });

    await transaction.save({ session });

    // Update user balance
    user.balance += amount;
    await user.save({ session });

    await session.commitTransaction();
    res.json({ transaction, balance: user.balance });
  } catch (err) {
    await session.abortTransaction();
    console.error('Error adding money:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
});

// Transfer money
router.post('/transfer', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, receiverEmail, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!receiverEmail) {
      return res.status(400).json({ message: 'Receiver email is required' });
    }

    const sender = await User.findById(req.user._id).session(session);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    const receiver = await User.findOne({ email: receiverEmail }).session(session);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction record
    const transaction = new Transaction({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      type: 'transfer',
      status: 'completed',
      description: description || 'Money transfer',
      transactionId: uuidv4(),
    });

    await transaction.save({ session });

    // Update balances
    sender.balance -= amount;
    receiver.balance += amount;

    await Promise.all([
      sender.save({ session }),
      receiver.save({ session })
    ]);

    await session.commitTransaction();
    res.json({ 
      transaction,
      balance: sender.balance
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Error transferring money:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
});

// Get user details by UPI ID
router.get('/user/:upiId', auth, async (req, res) => {
  try {
    console.log('Searching for user with UPI ID:', req.params.upiId);
    const user = await User.findOne({ upiId: req.params.upiId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only return necessary user details
    res.json({
      email: user.email,
      name: user.name,
      upiId: user.upiId
    });
  } catch (err) {
    console.error('Error fetching user by UPI ID:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
