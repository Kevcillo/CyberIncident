// arma el zip de entrega, nunca incluye secretos, datos locales ni dependencias

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const raiz = path.join(__dirname, "..");
// nombre de la entrega, al extraer en windows también es el nombre de la carpeta
const NOMBRE = "T1S7";
const nombreZip = `${NOMBRE}.zip`;
const destino = path.join(raiz, nombreZip);

// lo que nunca debe ir en la entrega
const EXCLUIDOS = new Set([".env", "database", "node_modules", ".git", "coverage", nombreZip]);

// recorre las carpetas y junta los archivos permitidos
function listarArchivos(carpeta, relativa = "") {
    const archivos = [];

    fs.readdirSync(carpeta, { withFileTypes: true }).forEach((entrada) => {
        if (EXCLUIDOS.has(entrada.name) || entrada.name.endsWith(".zip")) {
            return;
        }

        const ruta = path.join(relativa, entrada.name);

        if (entrada.isDirectory()) {
            archivos.push(...listarArchivos(path.join(carpeta, entrada.name), ruta));
        } else {
            archivos.push(ruta);
        }
    });

    return archivos;
}

const archivos = listarArchivos(raiz);

// control final por si algo excluido se coló
const prohibido = archivos.find((archivo) => archivo === ".env" || archivo.split(path.sep)[0] === "database");

if (prohibido) {
    console.error(`Se detuvo el empaquetado: ${prohibido} no debe ir en la entrega.`);
    process.exit(1);
}

const salida = fs.createWriteStream(destino);
const zip = archiver("zip", { zlib: { level: 9 } });

salida.on("close", () => {
    const carpetas = [...new Set(archivos.map((archivo) => archivo.split(path.sep)[0]))].sort();

    console.log(`Zip creado: ${nombreZip}, ${archivos.length} archivos, ${(zip.pointer() / 1024).toFixed(0)} KB`);
    console.log(`Contiene: ${carpetas.join(", ")}`);
    console.log("No contiene: .env, database, node_modules ni .git");
});

zip.on("error", (error) => {
    throw error;
});

zip.pipe(salida);
// los archivos van en la raíz del zip, windows ya crea la carpeta T1S7 al extraer
archivos.forEach((archivo) => zip.file(path.join(raiz, archivo), { name: archivo.split(path.sep).join("/") }));
zip.finalize();
