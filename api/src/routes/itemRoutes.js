const { Router } = require('express');
const ItemController = require('../controllers/ItemController');
const { itemRules } = require('../validators/itemValidators');

const router = Router();

router.get('/', ItemController.getAll);
router.get('/:id', ItemController.getById);
router.post('/', itemRules, ItemController.create);
router.put('/stock/:id', ItemController.adjustStock);
router.put('/:id', itemRules, ItemController.update);
router.delete('/:id', ItemController.remove);

module.exports = router;
