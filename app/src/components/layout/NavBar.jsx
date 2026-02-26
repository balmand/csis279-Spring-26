import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/clients', label: 'Clients' },
  { to: '/departments', label: 'Departments' },
];

const NavBar = () => {
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 3 }}>
          CSIS279 App
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {links.map((link) => (
            <Button
              key={link.to}
              color="inherit"
              component={NavLink}
              to={link.to}
              sx={{ '&.active': { textDecoration: 'underline' } }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
