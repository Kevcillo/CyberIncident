// anota cada petición con su identificador, resultado y duración

const crypto = require("crypto");

const bitacora = require("../config/bitacora");

// 5xx es error del servidor, 4xx es un pedido rechazado, el resto es normal
function nivelPorEstado(estado) {
    if (estado >= 500) {
        return "error";
    }

    if (estado >= 400) {
        return "warn";
    }

    return "info";
}

function registro(req, res, next) {
    const inicio = Date.now();

    // el identificador viaja en la respuesta para ubicar la petición en la bitácora
    req.id = crypto.randomUUID();
    res.set("X-Request-Id", req.id);

    res.on("finish", () => {
        // solo metadatos, nunca el cuerpo ni las cabeceras
        bitacora[nivelPorEstado(res.statusCode)]("petición", {
            id: req.id,
            metodo: req.method,
            ruta: req.originalUrl,
            estado: res.statusCode,
            duracionMs: Date.now() - inicio,
            usuario: req.usuario ? req.usuario.id : "anónimo",
        });
    });

    next();
}

module.exports = registro;
module.exports.nivelPorEstado = nivelPorEstado;
