const EmployeeRepository = require('../repositories/EmployeeRepository');
const ApiError = require('../middlewares/ApiError');

class EmployeeService {

    static async getAll() {

        return EmployeeRepository.getAll();
    }

    static async getById(id) {
        const employee = await EmployeeRepository.getById(id);
        if (!employee) {
            throw ApiError.notFound(`Employee with id ${id} was not found`);
        }
        return employee;
    }

    static async create({ employee_name, employee_email, employee_role, employee_dob, employee_department}) {
        
        return await EmployeeRepository.create({ 
            employee_name,
            employee_email,
            employee_role,
            employee_dob,
            employee_department
        });

    }

    static async update(id, { employee_name, employee_email, employee_role, employee_dob, employee_department }) {
        const employee = await EmployeeRepository.update(id, {
            employee_name,
            employee_email,
            employee_role,
            employee_dob,
            employee_department
        });
        if (!employee) {
            throw ApiError.notFound(`Employee with id ${id} was not found.`);
        }

        return employee;
    }

    static async remove(id) {
        const employee_deleted = await EmployeeRepository.remove(id);
        if (!employee_deleted) {
            throw ApiError.notFound(`Employee with id ${id} was not found.`);
        }
        console.log(employee_deleted); // <-- Future testing. Just in case.
    }
}

module.exports = EmployeeService;