const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const productRoutes = require('./routes/productRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const stockRoutes = require('./routes/stockRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
//emailRoutes
const emailRoutes = require('./routes/emailRoutes');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* ── Routes ── */
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);
app.use('/departments', departmentRoutes);
app.use('/products', productRoutes);
app.use('/items', itemRoutes);
app.use('/orders', orderRoutes);
app.use('/stock-adjustments', stockRoutes);
app.use('/transactions', transactionRoutes);
//emailRoutes
app.use('/email', emailRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;


