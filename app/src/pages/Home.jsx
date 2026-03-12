import { Paper, Typography } from '@mui/material';

const Home = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Home Page
      </Typography>
      <Typography>This app represents professional structure.</Typography>
    </Paper>
  );
};

export default Home;
