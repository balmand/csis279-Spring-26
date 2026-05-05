import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Grid, Typography, Paper, Box, Switch, Alert } from '@mui/material';
import { VideocamOff as VideoOffIcon, Videocam as VideoOnIcon } from '@mui/icons-material/';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import { styled } from '@mui/system';
import { SocketContext } from '../../context/Context';


const VideoSwitch = styled(Switch)(({ theme }) => ({
  width: 50, // Adjust the width
  height: 28, // Adjust the height
  padding: 6, // Adjust the padding
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(5px)', // Adjust the transform
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(20px)', // Adjust the transform
      '& .MuiSwitch-thumb:before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 22, // Adjust the width
    height: 22, // Adjust the height
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 14, // Adjust the borderRadius
  },
}));

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'center',
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '10px',
  border: '2px solid black',
  margin: '10px',
}));

const VideoPlayer = () => {
  const {
    name,
    callAccepted,
    callEnded,
    stream,
    setStream,
    userStream,
    mediaError,
    setMediaError,
    remoteName,
  } = useContext(SocketContext);
  const myV = useRef();
  const uV = useRef();
  const [videoOn, setVideoOn] = useState(false);

  useEffect(() => {
    try {
      if (stream && myV.current) {
        myV.current.srcObject = stream;
      }
      if (userStream && uV.current) {
        uV.current.srcObject = userStream;
      }
    } catch (error) {
      console.error(error);
    }
  }, [stream, userStream]);

  useEffect(() => {
    setVideoOn(!!stream);
  }, [stream]);

  const openVideo = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setMediaError(null);
        setStream(currentStream);
      })
      .catch((err) => {
        setMediaError(err?.message || 'Could not access camera/microphone');
        console.error(err);
      });
  }, [setStream, setMediaError]);

  const closeVideo = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(undefined);
  }, [stream, setStream]);

  const handleVideoChange = (event) => {
    event.preventDefault();
    try {
      setVideoOn(!videoOn);
      if (event.target.checked) {
        openVideo();
      } else {
        closeVideo();
      }
    } catch (error) {
      console.log(error);
    }

  }


  return (
    <StyledGridContainer container>
      {mediaError && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setMediaError(null)}>
            {mediaError}
          </Alert>
        </Grid>
      )}
      <StyledPaper>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: "300px", height: "200px", overflow: "hidden" }}>
              <Typography color={"primary"} variant="h5">{name || 'Name'}</Typography>
              {stream && (
                <video playsInline muted ref={myV} autoPlay style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              )}
              {!stream && (
                <VideocamOffOutlinedIcon
                  alt="No video available"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </Box>
            <VideoSwitch checked={videoOn} onChange={handleVideoChange} icon={<VideoOffIcon style={{ color: "black" }} />} checkedIcon={<VideoOnIcon color='primary' />} />
          </Grid>
        </Grid>
      </StyledPaper>
      {callAccepted && !callEnded && (
        <StyledPaper>
          <Grid container>
            <Grid item xs={12} md={6}>
              <Box sx={{ width: "300px", height: "200px", overflow: "hidden" }}>
                <Typography variant="h5">
                  <span className="text-success">{remoteName || 'Peer'}</span>
                </Typography>
                <video
                  playsInline
                  ref={uV}
                  autoPlay
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Box>
            </Grid>
          </Grid>
        </StyledPaper>
      )}
    </StyledGridContainer>
  );
};

export default VideoPlayer;
