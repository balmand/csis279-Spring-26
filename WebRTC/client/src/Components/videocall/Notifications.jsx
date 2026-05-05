import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Grid, Modal } from '@mui/material';
import { SocketContext } from '../../context/Context';
import { Call, CallEnd } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const Notifications = () => {
  const { answerCall, call, callAccepted, rejectCall } = useContext(SocketContext);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (call?.isReceivingCall && !callAccepted) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [call, callAccepted]);

  const answer = () => {
    answerCall();
    setOpen(false);
  };

  const decline = () => {
    rejectCall();
    setOpen(false);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={decline}
      >
        <Box sx={{ ...style }}>
          <Grid
            container
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <h3>
                <span className="fst-italic text-dark fw-bold">
                  {call?.name || 'Someone'}
                </span>{' '}
                is calling
              </h3>
            </Grid>
            <Grid item xs={5}>
              <Button variant="contained" color="success" onClick={answer}>
                <Call sx={{ marginRight: '1rem' }} /> Accept
              </Button>
            </Grid>
            <Grid item xs={5} sx={{ textAlign: 'center' }}>
              <Button variant="contained" color="error" onClick={decline}>
                <CallEnd sx={{ marginRight: '1rem' }} />
                Decline
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export default Notifications;
