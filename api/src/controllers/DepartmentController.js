const DepartmentService = require('../services/DepartmentService');

class DepartmentController {
    static async getAll(req, res, next) {
        try {
            const deps = await DepartmentService.getAll();
            return res.json(deps);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const dep = await DepartmentService.getById(req.params.id);
            return res.json(dep);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const dep = await DepartmentService.create(req.body);
            return res.status(201).json(dep);
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const dep = await DepartmentService.update(req.params.id, req.body);
            return res.status(201).json(dep);
        } catch (err) {
            next(err);
        }
    }

    static async remove(req, res, next) {
        try {
            await DepartmentService.remove(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = DepartmentController;
