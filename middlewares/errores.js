// manejo central de errores, todas las respuestas de error salen de aquí

const {
    ValidationError,
    UniqueConstraintError,
    ConnectionError,
    DatabaseError,
} = require("sequelize");

const { ErrorApp } = require("../errors/errores");
const bitacora = require("../config/bitacora");

// el detalle técnico queda en la bitácora, al usuario solo le llega un mensaje general
function anotarFallo(err, req) {
    bitacora.error(err.message, { id: req.id, tipo: err.name, pila: err.stack });
}

function responder(res, estado, mensaje, errores) {
    const cuerpo = { exito: false, mensaje };

    if (errores) {
        cuerpo.errores = errores;
    }

    return res.status(estado).json(cuerpo);
}

function rutaNoEncontrada(req, res) {
    responder(res, 404, `La ruta ${req.method} ${req.originalUrl} no existe.`);
}

// express necesita los cuatro parámetros para reconocerlo como manejador de errores
function manejadorErrores(err, req, res, _next) {

    if (err instanceof ErrorApp) {
        return responder(res, err.estado, err.message, err.errores);
    }

    // json mal escrito en el cuerpo de la petición
    if (err.type === "entity.parse.failed") {
        return responder(res, 400, "El cuerpo de la petición no es un JSON válido.");
    }

    if (err.type === "entity.too.large") {
        return responder(res, 413, "La petición es demasiado grande. El máximo es 10 KB.");
    }

    if (err instanceof UniqueConstraintError) {
        return responder(res, 409, "Ya existe un registro con esos datos.");
    }

    // reglas del modelo, un mensaje por campo
    if (err instanceof ValidationError) {
        const errores = {};

        err.errors.forEach((detalle) => {
            if (!errores[detalle.path]) {
                errores[detalle.path] = detalle.message;
            }
        });

        return responder(res, 400, "Los datos enviados no son válidos.", errores);
    }

    if (err instanceof ConnectionError) {
        anotarFallo(err, req);
        return responder(res, 503, "No hay conexión con la base de datos.");
    }

    if (err instanceof DatabaseError) {
        anotarFallo(err, req);
        return responder(res, 500, "Ocurrió un error en la base de datos.");
    }

    anotarFallo(err, req);

    responder(res, 500, "Ocurrió un error interno en el servidor.");
}

module.exports = { rutaNoEncontrada, manejadorErrores };
