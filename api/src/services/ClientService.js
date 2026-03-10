const ClientRepository = require('../repositories/ClientRepository');
const ApiError = require('../middlewares/ApiError');

class ClientService {
    static async getAll() {
        return ClientRepository.findAll();
    }

    static async getById(id) {
        const client = await ClientRepository.findById(id);
        if (!client) {
            throw ApiError.notFound(`Client with id ${id} not found`);
        }
        return client;
    }

    static async create({ name, email }) {
        return ClientRepository.create({ client_name: name, client_email: email });
    }

    static async update(id, { name, email }) {
        const client = await ClientRepository.update(id, { client_name: name, client_email: email });
        if (!client) {
            throw ApiError.notFound(`Client with id ${id} not found`);
        }
        return client;
    }

    static async remove(id) {
        const deleted = await ClientRepository.remove(id);
        if (!deleted) {
            throw ApiError.notFound(`Client with id ${id} not found`);
        }
    }
}

module.exports = ClientService;
