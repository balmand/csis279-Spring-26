const ApiError = require('../middlewares/ApiError');
const StatisticsRepository = require('../repositories/StatisticsRepository');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_BUCKETS = new Set(['day', 'week', 'month']);

const parseOptionalInt = (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        throw ApiError.badRequest(`${fieldName} must be a positive integer`);
    }
    return parsed;
};

const parseOptionalDate = (value, fieldName) => {
    if (!value) {
        return null;
    }
    if (!DATE_PATTERN.test(value)) {
        throw ApiError.badRequest(`${fieldName} must use YYYY-MM-DD format`);
    }
    return value;
};

class StatisticsService {
    static normalizeFilters(query) {
        const startDate = parseOptionalDate(query.startDate, 'startDate');
        const endDate = parseOptionalDate(query.endDate, 'endDate');
        const employeeId = parseOptionalInt(query.employeeId, 'employeeId');
        const itemId = parseOptionalInt(query.itemId, 'itemId');
        const category = query.category ? query.category.trim() : null;
        const lowSalesThresholdRaw = query.lowSalesThreshold ?? '2';
        const lowSalesThreshold = Number.parseInt(lowSalesThresholdRaw, 10);
        const bucket = query.bucket ? query.bucket.toLowerCase() : 'day';

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw ApiError.badRequest('startDate cannot be after endDate');
        }

        if (Number.isNaN(lowSalesThreshold) || lowSalesThreshold < 0) {
            throw ApiError.badRequest('lowSalesThreshold must be a non-negative integer');
        }

        if (!ALLOWED_BUCKETS.has(bucket)) {
            throw ApiError.badRequest('bucket must be one of: day, week, month');
        }

        return {
            startDate,
            endDate,
            employeeId,
            itemId,
            category: category || null,
            lowSalesThreshold,
            bucket,
        };
    }

    static async getSalesDashboard(query) {
        const filters = this.normalizeFilters(query);
        return StatisticsRepository.getSalesDashboard(filters);
    }
}

module.exports = StatisticsService;
