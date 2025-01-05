import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import { Close as CloseIcon, Share as ShareIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const QRCode = ({ open, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const qrData = JSON.stringify({
    upiId: user?.upiId,
    name: user?.name
  });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My UPI QR Code',
          text: `Send money to ${user?.name} using UPI ID: ${user?.upiId}`,
        });
      } else {
        await navigator.clipboard.writeText(user?.upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Receive Money
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
          <Typography variant="h6">{user?.name}</Typography>
          <Typography color="textSecondary">{user?.upiId}</Typography>
          
          <Box
            bgcolor="white"
            p={2}
            borderRadius={2}
            boxShadow={1}
            width="fit-content"
          >
            <QRCodeSVG
              value={qrData}
              size={200}
              level="H"
              includeMargin
              imageSettings={{
                src: "/logo192.png",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </Box>

          <Typography variant="body2" color="textSecondary" align="center">
            Scan this QR code to send money
          </Typography>

          <Button
            startIcon={<ShareIcon />}
            variant="outlined"
            onClick={handleShare}
          >
            {copied ? 'UPI ID Copied!' : 'Share UPI ID'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRCode;
