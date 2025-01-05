// client/src/pages/services/Recharge.js
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
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { PhoneAndroid, NetworkCell, Payment } from '@mui/icons-material';
import axios from 'axios';

const Recharge = () => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    operator: '',
    circle: '',
    amount: '',
    planType: 'prepaid'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const operators = [
    'Airtel',
    'Jio',
    'Vi',
    'BSNL'
  ];

  const circles = [
    'Andhra Pradesh',
    'Karnataka',
    'Kerala',
    'Tamil Nadu',
    'Maharashtra',
    'Delhi NCR',
    'Mumbai',
    'Others'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/transactions/recharge', formData);
      setSuccess('Recharge successful!');
      setFormData({
        mobileNumber: '',
        operator: '',
        circle: '',
        amount: '',
        planType: 'prepaid'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Recharge failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <PhoneAndroid color="primary" />
          <Typography variant="h5">
            Mobile Recharge
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Mobile Number"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneAndroid />
                </InputAdornment>
              ),
            }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Operator</InputLabel>
                <Select
                  name="operator"
                  value={formData.operator}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <NetworkCell />
                    </InputAdornment>
                  }
                >
                  {operators.map(op => (
                    <MenuItem key={op} value={op}>{op}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Circle</InputLabel>
                <Select
                  name="circle"
                  value={formData.circle}
                  onChange={handleChange}
                >
                  {circles.map(circle => (
                    <MenuItem key={circle} value={circle}>{circle}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  ₹
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !formData.mobileNumber || !formData.operator || !formData.circle || !formData.amount}
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
          >
            {loading ? 'Processing...' : 'Recharge Now'}
          </Button>
        </form>

        {/* Plans Section */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Popular Plans
          </Typography>
          <Grid container spacing={2}>
            {[199, 299, 499, 699].map((plan) => (
              <Grid item xs={6} sm={3} key={plan}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  variant="outlined"
                  onClick={() => setFormData({ ...formData, amount: plan.toString() })}
                >
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      ₹{plan}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Validity: {plan === 199 ? '28' : plan === 299 ? '56' : plan === 499 ? '84' : '365'} Days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Recharge;