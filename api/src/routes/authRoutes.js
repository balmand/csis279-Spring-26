const { Router } = require('express');
const AuthController = require('../controllers/AuthController');
const { registerRules, loginRules } = require('../validators/authValidators');

const router = Router();

router.post('/register', registerRules, AuthController.register);
router.post('/login', loginRules, AuthController.login);

module.exports = router;
