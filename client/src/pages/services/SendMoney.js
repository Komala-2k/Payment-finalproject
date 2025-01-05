import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Send as SendIcon } from '@mui/icons-material';

const useStyles = styled((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    maxWidth: 500,
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

function SendMoney() {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    note: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sending money:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Send Money
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            name="recipient"
            label="Recipient Email or Phone"
            variant="outlined"
            fullWidth
            required
            value={formData.recipient}
            onChange={handleChange}
          />
          <TextField
            name="amount"
            label="Amount ($)"
            variant="outlined"
            fullWidth
            required
            type="number"
            value={formData.amount}
            onChange={handleChange}
            InputProps={{
              inputProps: { min: 0, step: '0.01' },
            }}
          />
          <TextField
            name="note"
            label="Add a note (optional)"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={formData.note}
            onChange={handleChange}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            className={classes.submitButton}
            startIcon={<SendIcon />}
          >
            Send Money
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default SendMoney;
