const API = require('../services/response.service');

class UserController {
    // Defined as class properties with Arrow Functions to preserve the context ("this") when referencing the function.
    index = async (req, res) => {
        return API.success(res, 'Obteniendo toda la lista de usuarios.');
    }

    show = async (req, res) => {
        const { id } = req.params;
        return API.success(res, `Mostrando al usuario modelo con ID ${id}.`);
    }

    store = async (req, res) => {
        return API.created(res, 'Nuevo usuario creado correctamente.');
    }

    update = async (req, res) => {
        const { id } = req.params;
        return API.success(res, `El usuario ${id} fue actualizado correctamente.`);
    }

    destroy = async (req, res) => {
        const { id } = req.params;
        return API.success(res, `El usuario ${id} ha sido borrado exitosamente.`);
    }
}

// Instantiate
module.exports = new UserController();
