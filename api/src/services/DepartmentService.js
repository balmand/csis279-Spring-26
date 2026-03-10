const DepartmentRepository = require('../repositories/DepartmentRepository');
const ApiError = require('../middlewares/ApiError');

class DepartmentService {
    static async getAll() {
        return DepartmentRepository.findAll();
    }

    static async getById(id) {
        const dep = await DepartmentRepository.findById(id);
        if (!dep) {
            throw ApiError.notFound(`Department with id ${id} not found`);
        }
        return dep;
    }

    static async create({ name }) {
        return DepartmentRepository.create({ dep_name: name });
    }

    static async update(id, { name }) {
        const dep = await DepartmentRepository.update(id, { dep_name: name });
        if (!dep) {
            throw ApiError.notFound(`Department with id ${id} not found`);
        }
        return dep;
    }

    static async remove(id) {
        const deleted = await DepartmentRepository.remove(id);
        if (!deleted) {
            throw ApiError.notFound(`Department with id ${id} not found`);
        }
    }
}

module.exports = DepartmentService;
