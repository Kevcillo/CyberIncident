// revisa las variables obligatorias de producción antes de aceptar tráfico

const OBLIGATORIAS = ["JWT_SECRET", "DATABASE_URL", "CORS_ORIGENES"];
const LARGO_MINIMO_CLAVE = 32;

function esProduccion() {
    return process.env.NODE_ENV === "production";
}

// devuelve los problemas encontrados, solo con nombres, nunca con valores
function revisarProduccion(entorno = process.env) {
    const problemas = OBLIGATORIAS.filter((nombre) => !entorno[nombre] || !entorno[nombre].trim()).map(
        (nombre) => `falta ${nombre}`
    );

    if (entorno.JWT_SECRET && entorno.JWT_SECRET.trim().length < LARGO_MINIMO_CLAVE) {
        problemas.push(`JWT_SECRET debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres`);
    }

    // en producción todo se sirve por https, un origen http es un error de configuración
    const origenes = (entorno.CORS_ORIGENES || "").split(",").map((o) => o.trim()).filter(Boolean);
    origenes
        .filter((origen) => !origen.startsWith("https://"))
        .forEach((origen) => problemas.push(`el origen ${origen} de CORS_ORIGENES debe usar https`));

    return problemas;
}

module.exports = { OBLIGATORIAS, esProduccion, revisarProduccion };
