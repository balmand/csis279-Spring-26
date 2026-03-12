const StatisticsService = require('../services/StatisticsService');

class StatisticsController {
    static async getSalesDashboard(req, res, next) {
        try {
            const dashboard = await StatisticsService.getSalesDashboard(req.query);
            return res.json(dashboard);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = StatisticsController;
