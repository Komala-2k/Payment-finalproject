const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Transaction API is working!' });
});

// Get user details by UPI ID
router.get('/user/:upiId', auth, async (req, res) => {
  try {
    console.log('Searching for user with UPI ID:', req.params.upiId);
    const user = await User.findOne({ upiId: req.params.upiId });
    if (!user) {
      console.log('User not found with UPI ID:', req.params.upiId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Found user:', user.name);
    res.json({
      name: user.name,
      upiId: user.upiId,
      email: user.email
    });
  } catch (error) {
    console.error('Error in user lookup:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

// Get user balance
router.get('/balance', auth, async (req, res) => {
  try {
    console.log('Fetching balance for user:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User balance:', user.balance);
    res.json({ balance: user.balance || 0 });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Error fetching balance' });
  }
});

// Get transaction history
router.get('/history', auth, async (req, res) => {
  try {
    console.log('Fetching transaction history for user:', req.user.userId);
    
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user.userId },
        { receiver: req.user.userId }
      ]
    })
    .sort({ timestamp: -1 })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .limit(50);

    console.log(`Found ${transactions.length} transactions`);

    const formattedTransactions = transactions.map(transaction => {
      const isReceiver = transaction.receiver && 
                        transaction.receiver._id.toString() === req.user.userId;
      
      return {
        _id: transaction._id,
        type: isReceiver ? 'credit' : 'debit',
        amount: transaction.amount,
        date: transaction.timestamp,
        status: transaction.status,
        description: transaction.description || '',
        senderEmail: transaction.sender ? transaction.sender.email : 'System',
        recipientEmail: transaction.receiver ? transaction.receiver.email : 'System',
        senderName: transaction.sender ? transaction.sender.name : 'System',
        recipientName: transaction.receiver ? transaction.receiver.name : 'System'
      };
    });

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Error fetching transaction history' });
  }
});

// Add money to wallet
router.post('/add-money', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;
    console.log('Add money request:', { userId: req.user.userId, amount });
    
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Please enter a valid amount (minimum ₹1)' });
    }

    // Find user and update balance
    const user = await User.findById(req.user.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'User not found' });
    }

    // Create transaction record
    const transaction = new Transaction({
      sender: user._id,
      receiver: user._id,
      type: 'ADD_MONEY',
      amount: amount,
      status: 'COMPLETED',
      description: 'Added money to wallet'
    });

    // Update user balance
    user.balance = (user.balance || 0) + amount;

    // Save changes
    await Promise.all([
      transaction.save({ session }),
      user.save({ session })
    ]);

    await session.commitTransaction();
    console.log('Money added successfully:', {
      transactionId: transaction._id,
      amount,
      newBalance: user.balance
    });

    res.json({
      message: 'Money added successfully',
      balance: user.balance,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        timestamp: transaction.timestamp,
        status: transaction.status
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error adding money:', error);
    res.status(500).json({ message: 'Error adding money to wallet' });
  } finally {
    session.endSession();
  }
});

// Send money
router.post('/send', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientEmail, amount, description } = req.body;
    console.log('Send money request:', { sender: req.user.userId, recipientEmail, amount });

    if (!recipientEmail || !amount) {
      return res.status(400).json({ message: 'Recipient email and amount are required' });
    }

    if (amount < 1) {
      return res.status(400).json({ message: 'Amount must be at least ₹1' });
    }

    // Find sender
    const sender = await User.findById(req.user.userId).session(session);
    if (!sender) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Check sender balance
    if (sender.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Find recipient
    const recipient = await User.findOne({ email: recipientEmail }).session(session);
    if (!recipient) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create transaction
    const transaction = new Transaction({
      sender: sender._id,
      receiver: recipient._id,
      type: 'SEND_MONEY',
      amount: amount,
      description: description || 'Money transfer',
      status: 'COMPLETED'
    });

    // Update balances
    sender.balance -= amount;
    recipient.balance = (recipient.balance || 0) + amount;

    // Save all changes
    await Promise.all([
      transaction.save({ session }),
      sender.save({ session }),
      recipient.save({ session })
    ]);

    await session.commitTransaction();
    console.log('Money sent successfully:', {
      transactionId: transaction._id,
      amount,
      sender: sender.email,
      recipient: recipient.email
    });

    res.json({
      message: 'Money sent successfully',
      balance: sender.balance,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        recipient: {
          name: recipient.name,
          email: recipient.email
        },
        timestamp: transaction.timestamp,
        status: transaction.status
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error sending money:', error);
    res.status(500).json({ message: 'Error sending money' });
  } finally {
    session.endSession();
  }
});

module.exports = router;
