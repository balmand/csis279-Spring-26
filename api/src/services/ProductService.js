const ProductRepository = require('../repositories/ProductRepository');
const ApiError = require('../middlewares/ApiError');

class ProductService {
    static async getAll() {
        return ProductRepository.findAll();
    }

    static async getById(id) {
        const product = await ProductRepository.findById(id);
        if (!product) {
            throw ApiError.notFound(`Product with id ${id} not found`);
        }
        return product;
    }

    static async create(data) {
        return ProductRepository.create(data);
    }

    static async update(id, data) {
        const product = await ProductRepository.update(id, data);
        if (!product) {
            throw ApiError.notFound(`Product with id ${id} not found`);
        }
        return product;
    }

    static async remove(id) {
        const deleted = await ProductRepository.remove(id);
        if (!deleted) {
            throw ApiError.notFound(`Product with id ${id} not found`);
        }
    }
}

module.exports = ProductService;
