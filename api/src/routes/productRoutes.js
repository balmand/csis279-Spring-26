const { Router } = require('express');
const ProductController = require('../controllers/ProductController');
const { productRules } = require('../validators/productValidators');

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', productRules, ProductController.create);
router.put('/:id', productRules, ProductController.update);
router.delete('/:id', ProductController.remove);

module.exports = router;
