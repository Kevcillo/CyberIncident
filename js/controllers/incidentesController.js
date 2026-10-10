/**
 * CONTROLADOR DE INCIDENTES (Capa de Aplicación)
 * -------------------------------------------------------------------
 * Recibe las peticiones HTTP desde las rutas, consulta el repositorio
 * y devuelve la respuesta en formato JSON.
 */

const repositorio = require("../../data/incidentesRepository");

/**
 * GET /api/incidentes
 * Lista todos los incidentes.
 */
function listarIncidentes(req, res) {
    const incidentes = repositorio.obtenerTodos();

    res.status(200).json({
        exito: true,
        total: incidentes.length,
        datos: incidentes
    });
}

/**
 * GET /api/incidentes/:id
 * Obtiene un incidente específico por su ID.
 */
function obtenerIncidente(req, res) {
    const incidente = repositorio.obtenerPorId(req.params.id);

    if (!incidente) {
        return res.status(404).json({
            exito: false,
            mensaje: `No existe un incidente con id ${req.params.id}`
        });
    }

    res.status(200).json({
        exito: true,
        datos: incidente
    });
}

module.exports = {
    listarIncidentes,
    obtenerIncidente
};