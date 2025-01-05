const mongoose = require('mongoose');
require('dotenv').config();

const clearUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    
    // Drop the users collection
    await mongoose.connection.db.collection('users').drop();
    console.log('Users collection cleared successfully');
    
  } catch (error) {
    if (error.code === 26) {
      console.log('Users collection does not exist. Nothing to clear.');
    } else {
      console.error('Error clearing users:', error.message);
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error.message);
    }
  }
  process.exit(0);
};

clearUsers();
