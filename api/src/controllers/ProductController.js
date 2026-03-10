const ProductService = require('../services/ProductService');

class ProductController {
    static async getAll(req, res, next) {
        try {
            const products = await ProductService.getAll();
            return res.json(products);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const product = await ProductService.getById(req.params.id);
            return res.json(product);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const product = await ProductService.create(req.body);
            return res.status(201).json(product);
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const product = await ProductService.update(req.params.id, req.body);
            return res.json(product);
        } catch (err) {
            next(err);
        }
    }

    static async remove(req, res, next) {
        try {
            await ProductService.remove(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ProductController;
