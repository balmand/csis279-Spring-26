const TransactionRepository = require('../repositories/TransactionRepository');

class TransactionService {
    static async getAll() {
        return TransactionRepository.findAll();
    }

    static async getByOrderId(orderId) {
        return TransactionRepository.findByOrderId(orderId);
    }
}

module.exports = TransactionService;
