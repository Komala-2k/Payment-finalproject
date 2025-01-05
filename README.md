# Digital Payment Wallet

A full-stack digital payment wallet application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User Authentication (Register/Login)
- Secure Transaction Management
- Add Money to Wallet
- Send Money to Other Users
- Transaction History
- Real-time Balance Updates
- UPI ID Generation
- User Search by Name/UPI ID

## Tech Stack

### Frontend
- React.js
- Material-UI
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/Srivani7898/Paytm-clone-finalProject-.git 
cd Paytm-clone-finalproject
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

4. Create .env file in backend directory with:
```
PORT=5003
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
```

5. Start Backend Server
```bash
cd backend
npm start
```

6. Start Frontend Development Server
```bash
cd frontend
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Transactions
- POST /api/transactions/add-money - Add money to wallet
- POST /api/transactions/send-money - Send money to another user
- GET /api/transactions/history - Get transaction history
- GET /api/transactions/user/:upiId - Get user by UPI ID

## Security Features

- Password Hashing
- JWT Authentication
- Protected Routes
- MongoDB Transactions for Data Consistency
- Input Validation
- Error Handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
