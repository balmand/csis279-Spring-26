import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { getSalesDashboard } from '../services/statistics.service';

const defaultFilters = {
  startDate: '',
  endDate: '',
  employeeId: '',
  itemId: '',
  category: '',
  bucket: 'day',
  lowSalesThreshold: 2,
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US');

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));
const formatNumber = (value) => numberFormatter.format(Number(value || 0));
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const StatCard = ({ label, value, sublabel, color = 'text.primary' }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ color, fontWeight: 600 }}>
        {value}
      </Typography>
      {sublabel ? (
        <Typography variant="caption" color="text.secondary">
          {sublabel}
        </Typography>
      ) : null}
    </CardContent>
  </Card>
);

const ChartContainer = ({ title, subtitle, children }) => (
  <Paper sx={{ p: 2.5 }}>
    <Typography variant="h6">{title}</Typography>
    {subtitle ? (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {subtitle}
      </Typography>
    ) : null}
    {children}
  </Paper>
);

const EmptyChart = ({ message }) => (
  <Box
    sx={{
      minHeight: 280,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'text.secondary',
      textAlign: 'center',
      px: 2,
    }}
  >
    <Typography variant="body2">{message}</Typography>
  </Box>
);

const SalesStatisticsPage = () => {
  const { client } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async (nextFilters = filters) => {
    setLoading(true);
    setError('');

    const { ok, data } = await getSalesDashboard(nextFilters, client?.client_id);

    if (ok) {
      setDashboard(data);
    } else {
      setError(data.message || 'Failed to load sales statistics.');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (client?.role === 'admin') {
      loadDashboard(defaultFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.role]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleApplyFilters = async (event) => {
    event.preventDefault();
    await loadDashboard(filters);
  };

  const handleResetFilters = async () => {
    setFilters(defaultFilters);
    await loadDashboard(defaultFilters);
  };

  const availableFilters = dashboard?.availableFilters || {
    employees: [],
    categories: [],
    items: [],
  };

  const kpis = dashboard?.kpis;

  const employeeChartData = useMemo(
    () => (dashboard?.salesByEmployee || []).slice(0, 8),
    [dashboard]
  );

  const categoryChartData = useMemo(
    () => (dashboard?.salesByCategory || []).slice(0, 8),
    [dashboard]
  );

  const scatterData = useMemo(
    () =>
      (dashboard?.salesByItem || []).map((item) => ({
        ...item,
        name: item.itemName,
      })),
    [dashboard]
  );

  if (client?.role !== 'admin') {
    return (
      <Alert severity="warning">
        This page is restricted to admin users.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.75 }}>
          Sales Statistics Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revenue, profit, employee, and inventory performance analytics.
        </Typography>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Stack
          component="form"
          onSubmit={handleApplyFilters}
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
        >
          <TextField
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange('startDate')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange('endDate')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            select
            label="Employee"
            value={filters.employeeId}
            onChange={handleFilterChange('employeeId')}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Employees</MenuItem>
            {availableFilters.employees.map((employee) => (
              <MenuItem key={employee.employeeId} value={employee.employeeId}>
                {employee.employeeName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Category"
            value={filters.category}
            onChange={handleFilterChange('category')}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {availableFilters.categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Item"
            value={filters.itemId}
            onChange={handleFilterChange('itemId')}
            size="small"
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All Items</MenuItem>
            {availableFilters.items.map((item) => (
              <MenuItem key={item.itemId} value={item.itemId}>
                {item.itemName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Trend Bucket"
            value={filters.bucket}
            onChange={handleFilterChange('bucket')}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
          </TextField>
          <TextField
            label="Low Sales <="
            type="number"
            value={filters.lowSalesThreshold}
            onChange={handleFilterChange('lowSalesThreshold')}
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ width: 130 }}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={loading}>
              Apply
            </Button>
            <Button type="button" variant="outlined" onClick={handleResetFilters} disabled={loading}>
              Reset
            </Button>
          </Stack>
        </Stack>
        {error ? <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert> : null}
      </Paper>

      {loading && !dashboard ? (
        <Paper sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      ) : null}

      {dashboard ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            <StatCard label="Total Sales" value={formatCurrency(kpis.totalSales)} sublabel={`${formatNumber(kpis.ordersCount)} completed orders`} />
            <StatCard label="Net Profit" value={formatCurrency(kpis.netProfit)} sublabel={`Margin ${formatPercent(kpis.profitMargin)}`} color={kpis.netProfit >= 0 ? 'success.main' : 'error.main'} />
            <StatCard label="Total Profit" value={formatCurrency(kpis.totalProfit)} sublabel={`Loss ${formatCurrency(kpis.totalLoss)}`} color="success.main" />
            <StatCard label="Average Order Value" value={formatCurrency(kpis.averageOrderValue)} sublabel={`${formatNumber(kpis.unitsSold)} units sold`} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            <ChartContainer title="Sales and Profit Trend" subtitle="Line chart by selected time bucket">
              {dashboard.trend.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={dashboard.trend} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#1e5aa8" strokeWidth={2.5} name="Revenue" dot={false} />
                    <Line type="monotone" dataKey="profit" stroke="#0f766e" strokeWidth={2.5} name="Profit" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No completed sales in the selected filters." />
              )}
            </ChartContainer>

            <ChartContainer title="Profit vs Loss Overview" subtitle="Distribution of profitable and loss-making completed orders">
              <Box sx={{ minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2.5, px: 1 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Profitable Orders</Typography>
                  <Typography fontWeight={600}>{formatNumber(dashboard.profitLossOverview.profitableOrders)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Loss Orders</Typography>
                  <Typography fontWeight={600}>{formatNumber(dashboard.profitLossOverview.lossOrders)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Break-even Orders</Typography>
                  <Typography fontWeight={600}>{formatNumber(dashboard.profitLossOverview.breakEvenOrders)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Gross Profit</Typography>
                  <Typography fontWeight={600} color="success.main">{formatCurrency(dashboard.profitLossOverview.grossProfit)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Gross Loss</Typography>
                  <Typography fontWeight={600} color="error.main">{formatCurrency(dashboard.profitLossOverview.grossLoss)}</Typography>
                </Stack>
              </Box>
            </ChartContainer>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                xl: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            <ChartContainer title="Sales by Employee" subtitle="Revenue and profit comparison across staff">
              {employeeChartData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={employeeChartData} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="employeeName" interval={0} angle={-20} textAnchor="end" height={65} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#1e5aa8" name="Revenue" />
                    <Bar dataKey="profit" fill="#0f766e" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No employee sales found for current filters." />
              )}
            </ChartContainer>

            <ChartContainer title="Sales by Category" subtitle="Revenue comparison across product categories">
              {categoryChartData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={categoryChartData} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0d9488" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No category sales found for current filters." />
              )}
            </ChartContainer>
          </Box>

          <ChartContainer title="Item Revenue vs Profit" subtitle="Scatter view of item-level financial performance">
            {scatterData.length ? (
              <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 12, right: 20, left: 8, bottom: 8 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="revenue" name="Revenue" tickFormatter={(value) => `$${Math.round(value)}`} />
                  <YAxis type="number" dataKey="profit" name="Profit" tickFormatter={(value) => `$${Math.round(value)}`} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => {
                      if (name === 'unitsSold') return [formatNumber(value), 'Units Sold'];
                      return [formatCurrency(value), name === 'profit' ? 'Profit' : 'Revenue'];
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name || 'Item'}
                  />
                  <Scatter data={scatterData} fill="#ef6c00" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No item-level sales found for current filters." />
            )}
          </ChartContainer>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                xl: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            <Paper sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="h6">Employee Ranking</Typography>
                {kpis.bestEmployee ? <Chip size="small" color="success" label={`Best: ${kpis.bestEmployee.employeeName}`} /> : null}
              </Stack>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Profit</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Units</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.salesByEmployee.map((employee) => {
                      const isBest = kpis.bestEmployee?.employeeId === employee.employeeId;
                      const isWorst = kpis.worstEmployee?.employeeId === employee.employeeId;

                      return (
                        <TableRow key={employee.employeeId}>
                          <TableCell>
                            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                              <Typography variant="body2">{employee.employeeName}</Typography>
                              {isBest ? <Chip label="Best" color="success" size="small" variant="outlined" /> : null}
                              {isWorst ? <Chip label="Lowest" color="warning" size="small" variant="outlined" /> : null}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(employee.revenue)}</TableCell>
                          <TableCell align="right" sx={{ color: employee.profit >= 0 ? 'success.main' : 'error.main' }}>
                            {formatCurrency(employee.profit)}
                          </TableCell>
                          <TableCell align="right">{formatNumber(employee.ordersCount)}</TableCell>
                          <TableCell align="right">{formatNumber(employee.unitsSold)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Top-Selling Items</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Units</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Profit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.topSellingItems.map((item) => (
                      <TableRow key={item.itemId}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">{formatNumber(item.unitsSold)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.revenue)}</TableCell>
                        <TableCell align="right" sx={{ color: item.profit >= 0 ? 'success.main' : 'error.main' }}>
                          {formatCurrency(item.profit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Box>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Low-Selling and Non-Selling Items</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Units Sold</TableCell>
                    <TableCell align="right">Stock Qty</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Profit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard.lowSellingItems.map((item) => (
                    <TableRow key={item.itemId}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">{formatNumber(item.unitsSold)}</TableCell>
                      <TableCell align="right">{formatNumber(item.stockQuantity)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.revenue)}</TableCell>
                      <TableCell align="right" sx={{ color: item.profit >= 0 ? 'success.main' : 'error.main' }}>
                        {formatCurrency(item.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </>
      ) : null}
    </Stack>
  );
};

export default SalesStatisticsPage;
