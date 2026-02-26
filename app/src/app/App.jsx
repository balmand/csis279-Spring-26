import { Route, Routes } from 'react-router-dom';
import { Container } from '@mui/material';
import Layout from '../components/layout/Layout';
import { routes } from './routes';

function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Layout>
        <Routes>
          {routes.map(({ path, element: Page }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Routes>
      </Layout>
    </Container>
  );
}

export default App;
