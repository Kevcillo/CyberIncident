/**
 * CAPA DE DATOS (Data Layer)
 * -------------------------------------------------------------------
 * Unico modulo autorizado a leer la fuente de datos (archivo JSON).
 * En una arquitectura n-capas, la capa superior (logica de negocio)
 * nunca accede directamente al archivo/base de datos: siempre pasa
 * por este "repositorio".
 */

const fs = require("fs");
const path = require("path");

const RUTA_DATOS = path.join(__dirname, "incidentes.json");

function obtenerTodos() {
    const contenido = fs.readFileSync(RUTA_DATOS, "utf-8");
    return JSON.parse(contenido);
}

function obtenerPorId(id) {
    return obtenerTodos().find((incidente) => incidente.id === id);
}

module.exports = { obtenerTodos, obtenerPorId };
