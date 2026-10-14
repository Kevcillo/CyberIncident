// prepara el proyecto: crea el .env, la base de datos y los datos iniciales

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const raiz = path.join(__dirname, "..");
const archivoEnv = path.join(raiz, ".env");
const archivoEjemplo = path.join(raiz, ".env.example");

// valores usados si también falta .env.example
const valoresPorDefecto = [
    "PORT=3000",
    "DB_STORAGE=database/cyberincident.sqlite",
    "DB_STORAGE_TEST=database/test.sqlite",
    "JWT_SECRET=",
    "JWT_EXPIRA=2h",
    "CORS_ORIGENES=http://localhost:3000,http://127.0.0.1:3000",
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

// cada instalación genera su propia clave secreta, nunca se publica una fija
function asegurarClaveToken() {
    let contenido = fs.readFileSync(archivoEnv, "utf-8");
    const actual = contenido.match(/^JWT_SECRET=(.*)$/m);

    if (actual && actual[1].trim().length >= 32) {
        return;
    }

    const linea = `JWT_SECRET=${crypto.randomBytes(48).toString("hex")}`;

    if (actual) {
        contenido = contenido.replace(/^JWT_SECRET=.*$/m, linea);
    } else {
        contenido = `${contenido.replace(/\s*$/, "")}\n${linea}\n`;
    }

    if (!/^JWT_EXPIRA=/m.test(contenido)) {
        contenido = `${contenido.replace(/\s*$/, "")}\nJWT_EXPIRA=2h\n`;
    }

    fs.writeFileSync(archivoEnv, contenido);
    console.log("Se generó una clave secreta para los tokens");
}

asegurarClaveToken();

// agrega la lista de orígenes permitidos si el .env es de una versión anterior
function asegurarOrigenes() {
    const contenido = fs.readFileSync(archivoEnv, "utf-8");

    if (/^CORS_ORIGENES=/m.test(contenido)) {
        return;
    }

    const linea = "CORS_ORIGENES=http://localhost:3000,http://127.0.0.1:3000";
    fs.writeFileSync(archivoEnv, `${contenido.replace(/\s*$/, "")}\n${linea}\n`);
    console.log("Se agregó la lista de orígenes permitidos");
}

asegurarOrigenes();

function ejecutar(comando) {
    execSync(comando, { cwd: raiz, stdio: "inherit" });
}

console.log("Creando las tablas...");
ejecutar("npm run migrate");

console.log("Cargando los datos iniciales...");
ejecutar("npm run seed");

console.log("Listo. Ejecute npm start");
