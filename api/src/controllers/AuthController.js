const AuthService = require('../services/AuthService');

class AuthController {
    static async register(req, res, next) {
        try {
            const client = await AuthService.register(req.body);
            return res.status(201).json(client);
        } catch (err) {
            next(err);
        }
    }

    static async login(req, res, next) {
        try {
            console.log("reached")
            const client = await AuthService.login(req.body);
            return res.json({ authenticated: true, client });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AuthController;
