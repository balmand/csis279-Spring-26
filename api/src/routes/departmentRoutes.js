const { Router } = require('express');
const DepartmentController = require('../controllers/DepartmentController');
const { departmentRules } = require('../validators/departmentValidators');

const router = Router();

router.get('/', DepartmentController.getAll);
router.get('/:id', DepartmentController.getById);
router.post('/', departmentRules, DepartmentController.create);
router.put('/:id', departmentRules, DepartmentController.update);
router.delete('/:id', DepartmentController.remove);

module.exports = router;
