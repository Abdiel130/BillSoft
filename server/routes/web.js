const Route = require('../services/router.service');
const authMiddleware = require('../middlewares/auth.middleware');

const AuthController = require('../controllers/auth.controller');
const UserController = require('../controllers/user.controller');

// =========================================================
// RUTAS PÚBLICAS
// =========================================================
Route.group({ prefix: '/api' }, () => {
    Route.post('/auth/login', AuthController.login);
});

// =========================================================
// RUTAS PRIVADAS (Requieren un token JWT / Sesión)
// =========================================================
Route.group({ prefix: '/api', middlewares: [authMiddleware] }, () => {
    Route.get('/auth/profile', AuthController.profile);
    Route.apiResource('/users', UserController);
});

// Exportamos nuestro objeto router ya procesado hacia el index.js
module.exports = Route.export();
