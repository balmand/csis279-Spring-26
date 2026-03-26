const ClientService = require('../services/ClientService');
const { emitClientChanged } = require('../socket');

class ClientController {
    static async getAll(req, res, next) {
        try {
            const clients = await ClientService.getAll();
            return res.json(clients);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const client = await ClientService.getById(req.params.id);
            return res.json(client);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const client = await ClientService.create(req.body);
            emitClientChanged('created', client);
            return res.status(201).json(client);
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const client = await ClientService.update(req.params.id, req.body);
            emitClientChanged('updated', client);
            return res.json(client);
        } catch (err) {
            next(err);
        }
    }

    static async remove(req, res, next) {
        try {
            await ClientService.remove(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ClientController;
