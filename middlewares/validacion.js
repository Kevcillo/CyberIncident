// revisa que el cuerpo traiga solo campos permitidos y del tipo correcto

const { DatosInvalidos } = require("../errors/errores");

function validarCuerpo(permitidos) {
    return (req, res, next) => {
        const cuerpo = req.body || {};
        const errores = {};

        Object.keys(cuerpo).forEach((campo) => {
            if (!permitidos.includes(campo)) {
                errores[campo] = "Campo no permitido.";
            } else if (cuerpo[campo] !== null && typeof cuerpo[campo] !== "string") {
                errores[campo] = "Debe ser un texto.";
            }
        });

        if (Object.keys(errores).length > 0) {
            throw new DatosInvalidos(errores);
        }

        next();
    };
}

module.exports = validarCuerpo;
