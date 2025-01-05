import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  useTheme,
  Box,
  Alert
} from '@mui/material';
import { Add as AddIcon, Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [openAddMoney, setOpenAddMoney] = useState(false);
  const [openSendMoney, setOpenSendMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/transactions/balance');
      setBalance(response.data.balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions/history');
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchBalance(), fetchTransactions()]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddMoney = async () => {
    setProcessing(true);
    try {
      const response = await axios.post('/api/transactions/add-money', {
        amount: parseFloat(amount)
      });
      setBalance(response.data.balance);
      await fetchTransactions();
      setOpenAddMoney(false);
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add money');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMoney = async () => {
    setProcessing(true);
    try {
      const response = await axios.post('/api/transactions/transfer', {
        amount: parseFloat(amount),
        receiverEmail: recipientEmail,
        description
      });
      setBalance(response.data.balance);
      await fetchTransactions();
      setOpenSendMoney(false);
      setAmount('');
      setRecipientEmail('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send money');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: theme.palette.primary.main,
              color: 'white'
            }}
          >
            <Typography component="h2" variant="h6" gutterBottom>
              Your Balance
            </Typography>
            <Typography component="p" variant="h4">
              ₹{balance.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddMoney(true)}
              fullWidth
            >
              Add Money
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setOpenSendMoney(true)}
              fullWidth
            >
              Send Money
            </Button>
          </Paper>
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <List>
              {transactions.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No transactions found" />
                </ListItem>
              ) : (
                transactions.map((transaction, index) => (
                  <React.Fragment key={transaction._id}>
                    <ListItem>
                      <ListItemText
                        primary={transaction.description}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {transaction.type === 'transfer' 
                                ? transaction.sender._id === user.id
                                  ? `Sent to ${transaction.receiver.name}`
                                  : `Received from ${transaction.sender.name}`
                                : transaction.type === 'add_money'
                                ? 'Added money to wallet'
                                : 'Withdrew money'}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2">
                              Amount: ₹{transaction.amount.toFixed(2)}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < transactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Money Dialog */}
      <Dialog open={openAddMoney} onClose={() => setOpenAddMoney(false)}>
        <DialogTitle>Add Money to Wallet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={processing}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddMoney(false)} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleAddMoney} disabled={!amount || processing}>
            {processing ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Money Dialog */}
      <Dialog open={openSendMoney} onClose={() => setOpenSendMoney(false)}>
        <DialogTitle>Send Money</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Recipient Email"
            type="email"
            fullWidth
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            disabled={processing}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={processing}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={processing}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSendMoney(false)} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendMoney} 
            disabled={!amount || !recipientEmail || processing}
          >
            {processing ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;