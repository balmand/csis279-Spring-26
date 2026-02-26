import { useEffect, useState } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { deleteUser, getClients } from '../services/client.service';

const ClientList = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  const removeClient = async (id) => {
    await deleteUser(id);
    loadClients();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Client List</Typography>
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
        <Button component={Link} variant="contained" to="/clients/new">
          Create
        </Button>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.client_id}>
                <TableCell>{client.client_id}</TableCell>
                <TableCell>{client.client_name}</TableCell>
                <TableCell>{client.client_email}</TableCell>
                <TableCell>{moment(client.client_dob).format('YYYY-MM-DD')}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      component={Link}
                      to={`/clients/${client.client_id}/edit`}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => removeClient(client.client_id)}
                      variant="contained"
                      color="error"
                      size="small"
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default ClientList;
