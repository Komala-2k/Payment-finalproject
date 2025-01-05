import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CallReceived as ReceiveIcon,
  CallMade as SendIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledTypography = styled(Typography)(({ theme, transactionType }) => ({
  fontWeight: 'bold',
  color: transactionType === 'credit' 
    ? theme.palette.success.main 
    : theme.palette.success.main, // Changed to green for sent transactions too
}));

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Fetch transactions from the correct endpoint
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setTransactions(response.data);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
      });
  }, []);

  return (
    <StyledContainer>
      <StyledPaper>
        <Typography variant="h5" gutterBottom>
          Transaction History
        </Typography>
        <List>
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <ListItem key={transaction._id} divider>
                <ListItemIcon>
                  {transaction.type === 'credit' ? (
                    <ReceiveIcon color="success" />
                  ) : (
                    <SendIcon color="success" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={transaction.type === 'credit' ? 'Received' : 'Sent'}
                  secondary={new Date(transaction.date).toLocaleDateString()}
                />
                <ListItemSecondaryAction>
                  <StyledTypography transactionType={transaction.type}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
                  </StyledTypography>
                  <Chip
                    size="small"
                    label="Completed"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No transactions found"
                secondary="Your transaction history will appear here"
              />
            </ListItem>
          )}
        </List>
      </StyledPaper>
    </StyledContainer>
  );
}

export default Transactions;
