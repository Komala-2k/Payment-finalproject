const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  upiId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  resetPasswordToken: {
    type: String,
    sparse: true
  },
  resetPasswordExpires: {
    type: Date,
    sparse: true
  },
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Generate UPI ID if not set
userSchema.pre('save', function(next) {
  if (!this.upiId) {
    this.upiId = `${this.username}@digitalwallet`;
  }
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ upiId: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
