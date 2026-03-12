const { Router } = require('express');
const StatisticsController = require('../controllers/StatisticsController');
const { salesDashboardQueryRules } = require('../validators/statisticsValidators');
const requireAdmin = require('../middlewares/requireAdmin');

const router = Router();

router.get('/sales/dashboard', requireAdmin, salesDashboardQueryRules, StatisticsController.getSalesDashboard);

module.exports = router;
