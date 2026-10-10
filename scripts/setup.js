// prepara el proyecto: crea el .env, la base de datos y los datos iniciales

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const raiz = path.join(__dirname, "..");
const archivoEnv = path.join(raiz, ".env");
const archivoEjemplo = path.join(raiz, ".env.example");

// valores usados si también falta .env.example
const valoresPorDefecto = [
    "PORT=3000",
    "DB_STORAGE=database/cyberincident.sqlite",
    "DB_STORAGE_TEST=database/test.sqlite",
    "",
].join("\n");

if (!fs.existsSync(archivoEnv)) {
    if (fs.existsSync(archivoEjemplo)) {
        fs.copyFileSync(archivoEjemplo, archivoEnv);
        console.log("Se creó el archivo .env a partir de .env.example");
    } else {
        fs.writeFileSync(archivoEnv, valoresPorDefecto);
        console.log("Se creó el archivo .env con los valores por defecto");
    }
}

function ejecutar(comando) {
    execSync(comando, { cwd: raiz, stdio: "inherit" });
}

console.log("Creando las tablas...");
ejecutar("npm run migrate");

console.log("Cargando los incidentes iniciales...");
ejecutar("npm run seed");

console.log("Listo. Ejecute npm start");
