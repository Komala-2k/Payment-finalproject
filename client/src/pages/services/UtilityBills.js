// client/src/pages/services/UtilityBills.js
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ElectricBolt,
  WaterDrop,
  LocalGasStation,
  Wifi,
  LiveTv,
  Receipt,
  Payment
} from '@mui/icons-material';
import axios from 'axios';

const UtilityBills = () => {
  const [formData, setFormData] = useState({
    billType: '',
    provider: '',
    consumerId: '',
    amount: '',
    billNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const billTypes = [
    { id: 'electricity', name: 'Electricity', icon: <ElectricBolt /> },
    { id: 'water', name: 'Water', icon: <WaterDrop /> },
    { id: 'gas', name: 'Gas', icon: <LocalGasStation /> },
    { id: 'internet', name: 'Internet', icon: <Wifi /> },
    { id: 'dth', name: 'DTH', icon: <LiveTv /> }
  ];

  const providers = {
    electricity: ['State Electricity Board', 'Adani Electricity', 'Tata Power'],
    water: ['Municipal Corporation', 'Water Authority'],
    gas: ['Indane', 'HP Gas', 'Bharat Gas'],
    internet: ['Airtel', 'Jio Fiber', 'ACT Fibernet', 'BSNL'],
    dth: ['Tata Sky', 'Dish TV', 'Airtel DTH', 'Sun Direct']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset provider when bill type changes
      ...(name === 'billType' && { provider: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/transactions/utility-bill', formData);
      setSuccess('Bill payment successful!');
      setFormData({
        billType: '',
        provider: '',
        consumerId: '',
        amount: '',
        billNumber: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getIconForBillType = (type) => {
    return billTypes.find(bill => bill.id === type)?.icon || <Receipt />;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Receipt color="primary" />
          <Typography variant="h5">
            Pay Utility Bills
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Bill Type Selection */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {billTypes.map((type) => (
                <Grid item xs={6} sm={4} md={2.4} key={type.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: formData.billType === type.id ? 2 : 1,
                      borderColor: formData.billType === type.id ? 'primary.main' : 'grey.300',
                    }}
                    onClick={() => handleChange({ target: { name: 'billType', value: type.id } })}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 1 }}>{type.icon}</Box>
                      <Typography variant="body2">{type.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {formData.billType && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Provider</InputLabel>
                  <Select
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        {getIconForBillType(formData.billType)}
                      </InputAdornment>
                    }
                  >
                    {providers[formData.billType]?.map(provider => (
                      <MenuItem key={provider} value={provider}>{provider}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Consumer ID / Account Number"
                  name="consumerId"
                  value={formData.consumerId}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bill Number"
                  name="billNumber"
                  value={formData.billNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₹
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading || !formData.provider || !formData.consumerId || !formData.amount}
                  startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                >
                  {loading ? 'Processing...' : 'Pay Bill'}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default UtilityBills;