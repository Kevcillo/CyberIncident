// configuración de la base de datos, todo sale de las variables de entorno

const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");

require("dotenv").config({ path: path.join(raiz, ".env"), quiet: true });

// detiene todo si falta una variable obligatoria
function variable(nombre) {
    const valor = process.env[nombre];

    if (!valor) {
        throw new Error(
            `Falta la variable de entorno ${nombre}. Ejecute npm run setup o copie .env.example como .env`
        );
    }

    return valor;
}

// ruta absoluta del archivo de la base, crea la carpeta si no existe
function archivoBase(nombre) {
    const ruta = path.resolve(raiz, variable(nombre));
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    return ruta;
}

const comun = {
    dialect: "sqlite",
    logging: false,
    seederStorage: "sequelize",
};

module.exports = {
    development: { ...comun, storage: archivoBase("DB_STORAGE") },
    production: { ...comun, storage: archivoBase("DB_STORAGE") },
    test: { ...comun, storage: archivoBase("DB_STORAGE_TEST") },
};
