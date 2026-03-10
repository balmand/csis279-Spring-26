import { Box } from '@mui/material';
import NavBar from './NavBar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { client } = useAuth();

  return (
    <>
      {client && <NavBar />}
      <Box component="main">{children}</Box>
    </>
  );
};

export default Layout;
