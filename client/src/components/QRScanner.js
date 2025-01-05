import React, { useState } from 'react';
import QrReader from 'react-qr-scanner';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, CameraAlt as CameraIcon } from '@mui/icons-material';

const QRScanner = ({ open, onClose, onScan }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera. Please make sure you have given camera permissions.');
  };

  const handleScan = (data) => {
    if (data) {
      setLoading(true);
      try {
        const parsedData = JSON.parse(data.text);
        if (parsedData.upiId) {
          onScan(parsedData);
          onClose();
        }
      } catch (err) {
        console.error('Invalid QR code:', err);
        setError('Invalid QR code. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Scan QR Code
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          p={2}
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <Box
              sx={{
                width: '100%',
                maxWidth: 300,
                height: 300,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
              }}
            >
              <QrReader
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
                constraints={{
                  video: { facingMode: 'environment' }
                }}
              />
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  background: 'rgba(0,0,0,0.1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '20%',
                    left: '20%',
                    right: '20%',
                    bottom: '20%',
                    border: '2px solid #fff',
                    borderRadius: 1,
                  },
                }}
              >
                <CameraIcon sx={{ fontSize: 40, color: 'white', opacity: 0.8 }} />
              </Box>
            </Box>
          )}

          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          <Typography variant="body2" color="textSecondary" align="center">
            Point your camera at a QR code to scan
          </Typography>

          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;
