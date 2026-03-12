const { Router } = require('express');
const ClientController = require('../controllers/ClientController');
const { clientRules } = require('../validators/clientValidators');

const router = Router();

router.get('/', ClientController.getAll);
router.get('/:id', ClientController.getById);
router.post('/', clientRules, ClientController.create);
router.put('/:id', clientRules, ClientController.update);
router.delete('/:id', ClientController.remove);

module.exports = router;
