const EmployeeService = require('../services/EmployeeService');

class EmployeeController {
    static async getAll(req, res, next) {
        try {
            const employees = await EmployeeService.getAll();
            return res.json(employees);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const employee = await EmployeeService.getById(req.params.id);
            return res.json(employee);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const employee = await EmployeeService.create(req.body);
            return res.status(201).json(employee);
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const employee = await EmployeeService.update(req.params.id, req.body);
            return res.json(employee);
        } catch (err) {
            next(err);
        }
    }

    static async remove(req, res, next) {
        try {
            await EmployeeService.remove(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = EmployeeController;
