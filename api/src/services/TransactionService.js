const TransactionRepository = require('../repositories/TransactionRepository');

class TransactionService {
    static async getAll(query = {}) {
        return TransactionRepository.findAll(query);
    }

    static async getByOrderId(orderId) {
        return TransactionRepository.findByOrderId(orderId);
    }
}

module.exports = TransactionService;
