import React, { useState, useContext } from 'react';
import { Button, TextField, Grid, Typography, Container, Paper, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Assignment, Phone, PhoneDisabled } from '@mui/icons-material';

import { SocketContext } from '../../context/Context';

const StyledForm = styled('form')({
  display: 'flex',
  flexDirection: 'column',
});

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row', // Align elements horizontally for md and up breakpoints
  },
}));

const StyledGridItem = styled(Grid)(({ theme }) => ({
  padding: 20,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: 20,
}));

const Sidebar = ({ children }) => {
  const { me, callAccepted, name, setName, callEnded, leaveCall, callUser } = useContext(SocketContext);
  const [idToCall, setIdToCall] = useState('');
  const [showCopySnackBar, setShowCopySnackBar] = useState(false);
  const [warningMessage, setWarningMessage] = useState({
    message: '',
    open: false,
  });

  const isValidSocketId = (value) => {
    const v = String(value).trim();
    return v.length >= 8 && /^[\w-]+$/.test(v);
  };

  const handlePlaceCall = () => {
    const tid = idToCall.trim();
    if (!isValidSocketId(tid)) {
      setWarningMessage({
        open: true,
        message: 'Enter a valid peer ID (copy from the other person).',
      });
      return;
    }
    callUser(tid);
  };

  return (
    <Container>
      <Paper elevation={10}>
        <StyledForm noValidate autoComplete="off">
          <StyledGridContainer container alignItems="flex-start"> {/* Align items at the top */}
            <StyledGridItem item xs={12} md={6}>
              <Typography gutterBottom variant="h6">Account Info</Typography>
              <TextField
                label="Name"
                placeholder="Display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputLabelProps={{ shrink: !!name }}
                fullWidth
              />
              <CopyToClipboard text={me} onCopy={() => setShowCopySnackBar(true)}>
                <StyledButton
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!me}
                  startIcon={<Assignment fontSize="large" />}
                >
                  Copy Your ID
                </StyledButton>
              </CopyToClipboard>
            </StyledGridItem>
            <StyledGridItem item xs={12} md={6}>
              <Typography gutterBottom variant="h6">Make a call</Typography>
              <TextField
                label="ID to call"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
                fullWidth
                placeholder="Paste the other person's ID"
              />
              {callAccepted && !callEnded ? (
                <StyledButton variant="contained" color="secondary" startIcon={<PhoneDisabled fontSize="large" />} fullWidth onClick={leaveCall}>
                  Hang Up
                </StyledButton>
              ) : (
                <StyledButton
                  variant="contained"
                  color="primary"
                  disabled={!me || !idToCall.trim()}
                  startIcon={<Phone fontSize="large" />}
                  fullWidth
                  onClick={handlePlaceCall}
                >
                  Call
                </StyledButton>
              )}
            </StyledGridItem>
          </StyledGridContainer>
        </StyledForm>
        {children}
      </Paper>
      <Snackbar open={showCopySnackBar} autoHideDuration={5000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={() => setShowCopySnackBar(false)}>
        <Alert severity="success">Your ID was copied to the clipboard.</Alert>
      </Snackbar>
      <Snackbar open={warningMessage.open} autoHideDuration={5000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={() => setWarningMessage({ message: '', open: false })}>
        <Alert severity="warning">{warningMessage.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Sidebar;
