// configuración de los tokens de sesión, sale de las variables de entorno

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const LARGO_MINIMO_CLAVE = 32;

const clave = process.env.JWT_SECRET;

// una clave corta se puede adivinar, por eso se exige un largo mínimo
if (!clave || clave.length < LARGO_MINIMO_CLAVE) {
    throw new Error(
        `Falta la variable de entorno JWT_SECRET o tiene menos de ${LARGO_MINIMO_CLAVE} caracteres. Ejecute npm run setup`
    );
}

module.exports = {
    claveToken: clave,
    duracionToken: process.env.JWT_EXPIRA || "2h",
};
