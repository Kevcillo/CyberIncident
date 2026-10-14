// limpia los textos que llegan en el cuerpo de la petición antes de usarlos

const { DatosInvalidos } = require("../errors/errores");

// campos que se guardan tal cual, una contraseña puede tener cualquier símbolo
const SIN_LIMPIAR = ["contrasena"];

// caracteres de control invisibles, se conservan el salto de línea y el tabulador
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const ETIQUETAS = /<[^>]*>?/g;

// los bloques de código se quitan completos, con su contenido
const BLOQUES = /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;

function limpiarTexto(texto) {
    return texto.replace(CONTROL, "").replace(BLOQUES, "").replace(ETIQUETAS, "").trim();
}

function limpieza(req, res, next) {
    const cuerpo = req.body;

    if (cuerpo === undefined || cuerpo === null) {
        return next();
    }

    // el cuerpo debe ser un objeto, no una lista ni un valor suelto
    if (typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
        throw new DatosInvalidos({ general: "El cuerpo de la petición debe ser un objeto JSON." });
    }

    Object.keys(cuerpo).forEach((campo) => {
        if (typeof cuerpo[campo] === "string" && !SIN_LIMPIAR.includes(campo)) {
            cuerpo[campo] = limpiarTexto(cuerpo[campo]);
        }
    });

    next();
}

module.exports = { limpieza, limpiarTexto };
