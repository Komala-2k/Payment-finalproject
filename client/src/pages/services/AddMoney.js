// client/src/pages/services/AddMoney.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { CreditCard, AccountBalance, Payment } from '@mui/icons-material';
import axios from 'axios';

const AddMoney = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: <Payment /> },
    { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard /> },
    { id: 'netbanking', name: 'Net Banking', icon: <AccountBalance /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/transactions/add-money', {
        amount,
        paymentMethod
      });
      setSuccess('Money added successfully!');
      setAmount('');
      setPaymentMethod('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Add Money to Wallet
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
            }}
          />

          <Typography variant="h6" gutterBottom>
            Select Payment Method
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={4} key={method.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: paymentMethod === method.id ? 2 : 1,
                    borderColor: paymentMethod === method.id ? 'primary.main' : 'grey.300',
                  }}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      {method.icon}
                      <Typography>{method.name}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !amount || !paymentMethod}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Money'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AddMoney;