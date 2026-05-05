import { Container, Typography } from "@mui/material";
import React from "react";
import VideoPlayer from "../../Components/videocall/VideoPlayer";
import Sidebar from "../../Components/videocall/Sidebar";
import Notifications from "../../Components/videocall/Notifications";

const VideoChat = () => {
  return (
    <>
      <Container maxWidth="xl" sx={{ width: "100%" }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ backgroundColor: "primary.main", width: "100%", color: "#fff" }}
        >
          Video Chat
        </Typography>
        <VideoPlayer />
        <Sidebar>
          <Notifications />
        </Sidebar>
      </Container>
    </>
  );
};

export default VideoChat;
