import { Paper, Typography } from '@mui/material';

const About = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        About Page
      </Typography>
      <Typography>Minimal CRUD application.</Typography>
    </Paper>
  );
};

export default About;
