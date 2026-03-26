import { Route, Routes, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Layout from '../components/layout/Layout';
import { routes } from './routes';
import { useAuth } from '../store/hooks/useAuth';
import ClientRealtimeSync from './ClientRealtimeSync';

const authPaths = ['/login', '/register'];

function App() {
  const { client } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ClientRealtimeSync />
      <Layout>
        <Routes>
          {client
            ? routes
                .filter((r) => !authPaths.includes(r.path))
                .map(({ path, element: Page }) => (
                  <Route key={path} path={path} element={<Page />} />
                ))
            : routes
                .filter((r) => authPaths.includes(r.path))
                .map(({ path, element: Page }) => (
                  <Route key={path} path={path} element={<Page />} />
                ))}
          <Route
            path="*"
            element={<Navigate to={client ? '/' : '/login'} replace />}
          />
        </Routes>
      </Layout>
    </Container>
  );
}

export default App;
