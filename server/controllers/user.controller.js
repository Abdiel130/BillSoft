class UserController {
    // Definimos como propiedades de clase con Arrow Functions para mantener el context("this") al referenciar la función.
    index = async (req, res) => {
        return res.json({ success: true, message: 'Obteniendo toda la lista de usuarios.' });
    }

    show = async (req, res) => {
        const { id } = req.params;
        return res.json({ success: true, message: `Mostrando al usuario modelo con ID ${id}.` });
    }

    store = async (req, res) => {
        return res.json({ success: true, message: 'Nuevo usuario creado correctamente.' });
    }

    update = async (req, res) => {
        const { id } = req.params;
        return res.json({ success: true, message: `El usuario ${id} fue actualizado correctamente.` });
    }

    destroy = async (req, res) => {
        const { id } = req.params;
        return res.json({ success: true, message: `El usuario ${id} ha sido borrado exitosamente.` });
    }
}

// Instanciamos
module.exports = new UserController();
