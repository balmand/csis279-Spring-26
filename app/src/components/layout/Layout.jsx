import { Box } from '@mui/material';
import NavBar from './NavBar';

const Layout = ({ children }) => {
  return (
    <>
      <NavBar />
      <Box component="main">{children}</Box>
    </>
  );
};

export default Layout;
