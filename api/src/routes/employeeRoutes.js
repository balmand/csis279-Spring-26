const { Router } = require('express');
const EmployeeController = require('../controllers/EmployeeController');
const { employeeRules } = require('../validators/employeeValidators');

const router = Router();

router.get('/', EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);
router.post('/', employeeRules, EmployeeController.create);
router.put('/:id', employeeRules, EmployeeController.update);
router.delete('/:id', EmployeeController.remove);


module.exports = router;