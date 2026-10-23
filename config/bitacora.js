// bitácora del servidor: niveles info, warn y error, sin datos sensibles

const NIVELES = ["INFO", "WARN", "ERROR"];

// campos que nunca se escriben aunque lleguen por error
const SENSIBLES = ["contrasena", "password", "token", "authorization", "jwt_secret", "clave", "database_url"];

function esSensible(nombre) {
    const minuscula = nombre.toLowerCase();
    return SENSIBLES.some((palabra) => minuscula.includes(palabra));
}

function ocultar(datos) {
    const limpio = {};

    Object.entries(datos).forEach(([nombre, valor]) => {
        limpio[nombre] = esSensible(nombre) ? "[oculto]" : valor;
    });

    return limpio;
}

// producción escribe json, una línea por evento; desarrollo, texto legible
function formatear(entrada, formato) {
    if (formato === "json") {
        return JSON.stringify(entrada);
    }

    const { fecha, nivel, mensaje, ...resto } = entrada;
    const extra = Object.entries(resto).map(([nombre, valor]) => `${nombre}=${valor}`).join(" ");

    return `[${fecha}] ${nivel.padEnd(5)} ${mensaje}${extra ? ` ${extra}` : ""}`;
}

// los errores van a la salida de errores, el resto a la salida normal
function escribirEnConsola(linea, nivel) {
    if (nivel === "ERROR") {
        console.error(linea);
    } else {
        console.log(linea);
    }
}

function crearBitacora({ formato = "texto", escribir = escribirEnConsola } = {}) {
    function anotar(nivel, mensaje, datos = {}) {
        const entrada = { fecha: new Date().toISOString(), nivel, mensaje, ...ocultar(datos) };
        escribir(formatear(entrada, formato), nivel);
        return entrada;
    }

    return {
        info: (mensaje, datos) => anotar("INFO", mensaje, datos),
        warn: (mensaje, datos) => anotar("WARN", mensaje, datos),
        error: (mensaje, datos) => anotar("ERROR", mensaje, datos),
    };
}

// en las pruebas no se llena la consola
function bitacoraPorEntorno() {
    if (process.env.NODE_ENV === "test") {
        return crearBitacora({ escribir: () => {} });
    }

    return crearBitacora({ formato: process.env.NODE_ENV === "production" ? "json" : "texto" });
}

module.exports = { ...bitacoraPorEntorno(), crearBitacora, ocultar, NIVELES };
