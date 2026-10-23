// configuración de la base de datos, todo sale de las variables de entorno
// con DATABASE_URL se usa postgresql, sin ella sqlite en un archivo local

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
    logging: false,
    seederStorage: "sequelize",
};

function sqlite(nombreVariable) {
    return { ...comun, dialect: "sqlite", storage: archivoBase(nombreVariable) };
}

// postgresql en un servidor, la conexión cifrada se activa con DB_SSL
function postgres() {
    const cifrada = process.env.DB_SSL === "true";

    return {
        ...comun,
        dialect: "postgres",
        url: process.env.DATABASE_URL,
        dialectOptions: cifrada ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    };
}

function principal() {
    return process.env.DATABASE_URL ? postgres() : sqlite("DB_STORAGE");
}

// cada entorno se arma solo cuando se pide, así producción no exige el archivo sqlite
module.exports = {
    get development() {
        return principal();
    },
    get production() {
        return principal();
    },
    // las pruebas siempre usan su propia base sqlite, nunca la real
    get test() {
        return sqlite("DB_STORAGE_TEST");
    },
};
