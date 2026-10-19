// controlador de incidentes, los errores los atiende el middleware central

const { Incidente } = require("../models");
const { NoEncontrado, DatosInvalidos } = require("../errors/errores");

const CAMPOS_CREAR = ["titulo", "tipo", "prioridad", "fecha", "reportadoPor", "descripcion"];
const CAMPOS_EDITAR = ["titulo", "tipo", "prioridad", "estado", "fecha", "responsable", "descripcion"];

// quita espacios al inicio y al final de los textos
function limpiar(datos, campos) {
    const resultado = {};

    campos.forEach((campo) => {
        if (datos[campo] !== undefined) {
            resultado[campo] = typeof datos[campo] === "string" ? datos[campo].trim() : datos[campo];
        }
    });

    return resultado;
}

function leerId(req) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        throw new DatosInvalidos({ id: "El id debe ser un número entero positivo." });
    }

    return id;
}

async function buscarOFallar(id) {
    const incidente = await Incidente.findByPk(id);

    if (!incidente) {
        throw new NoEncontrado(`No existe un incidente con id ${id}`);
    }

    return incidente;
}

// GET /api/incidentes, acepta filtros por estado, prioridad y tipo
async function listarIncidentes(req, res) {
    const permitidos = {
        estado: Incidente.ESTADOS,
        prioridad: Incidente.PRIORIDADES,
        tipo: Incidente.TIPOS,
    };

    const filtros = {};
    const errores = {};

    Object.entries(permitidos).forEach(([campo, valores]) => {
        const valor = req.query[campo];

        if (valor === undefined || valor === "") {
            return;
        }

        if (!valores.includes(valor)) {
            errores[campo] = `Filtro no válido. Use uno de: ${valores.join(", ")}.`;
            return;
        }

        filtros[campo] = valor;
    });

    if (Object.keys(errores).length > 0) {
        throw new DatosInvalidos(errores, "Los filtros enviados no son válidos.");
    }

    const incidentes = await Incidente.findAll({
        where: filtros,
        attributes: Incidente.CAMPOS_LISTADO,
        order: [["id", "ASC"]],
    });

    res.status(200).json({ exito: true, total: incidentes.length, datos: incidentes });
}

// GET /api/incidentes/:id
async function obtenerIncidente(req, res) {
    const incidente = await buscarOFallar(leerId(req));

    res.status(200).json({ exito: true, datos: incidente });
}

// POST /api/incidentes
async function crearIncidente(req, res) {
    const datos = limpiar(req.body || {}, CAMPOS_CREAR);

    const creado = await Incidente.create(datos, { fields: CAMPOS_CREAR });

    // se devuelve tal como quedó en la base
    const nuevo = await Incidente.findByPk(creado.id);

    res.status(201).json({ exito: true, datos: nuevo });
}

// PATCH /api/incidentes/:id, cambia solo los campos enviados
async function actualizarIncidente(req, res) {
    const incidente = await buscarOFallar(leerId(req));
    const cambios = limpiar(req.body || {}, CAMPOS_EDITAR);
    const campos = Object.keys(cambios);

    if (campos.length === 0) {
        throw new DatosInvalidos({
            general: `Envíe al menos uno de estos campos: ${CAMPOS_EDITAR.join(", ")}.`,
        });
    }

    await incidente.update(cambios, { fields: campos });

    res.status(200).json({ exito: true, datos: incidente });
}

// PUT /api/incidentes/:id, reemplaza el incidente completo, exige todos los campos editables
async function reemplazarIncidente(req, res) {
    const incidente = await buscarOFallar(leerId(req));
    const datos = limpiar(req.body || {}, CAMPOS_EDITAR);
    const faltantes = CAMPOS_EDITAR.filter((campo) => datos[campo] === undefined);

    if (faltantes.length > 0) {
        const errores = {};
        faltantes.forEach((campo) => {
            errores[campo] = "Campo obligatorio para reemplazar el incidente. Use PATCH para cambios parciales.";
        });

        throw new DatosInvalidos(errores);
    }

    await incidente.update(datos, { fields: CAMPOS_EDITAR });

    res.status(200).json({ exito: true, datos: incidente });
}

// DELETE /api/incidentes/:id
async function eliminarIncidente(req, res) {
    const incidente = await buscarOFallar(leerId(req));

    await incidente.destroy();

    res.status(200).json({ exito: true, datos: incidente });
}

module.exports = {
    CAMPOS_CREAR,
    CAMPOS_EDITAR,
    listarIncidentes,
    obtenerIncidente,
    crearIncidente,
    actualizarIncidente,
    reemplazarIncidente,
    eliminarIncidente,
};
