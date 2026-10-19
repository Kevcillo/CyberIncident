// mide la consulta de incidentes con muchos datos, antes y después de las mejoras
// usa una base temporal en memoria, no toca los datos reales

const zlib = require("zlib");
const { Sequelize } = require("sequelize");

const CANTIDAD = 20000;
const REPETICIONES = 30;

const sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
const Incidente = require("../models/incidente")(sequelize);

const filtro = { estado: "Abierto", prioridad: "Alta" };

// genera incidentes de prueba repartidos entre todos los valores posibles
function generar(cantidad) {
    const lista = [];

    for (let i = 0; i < cantidad; i++) {
        lista.push({
            titulo: `Incidente de prueba ${i}`,
            tipo: Incidente.TIPOS[i % Incidente.TIPOS.length],
            prioridad: Incidente.PRIORIDADES[i % Incidente.PRIORIDADES.length],
            estado: Incidente.ESTADOS[(i * 7) % Incidente.ESTADOS.length],
            fecha: "2026-10-17",
            reportadoPor: "soc@cyberincident.com",
            responsable: "Equipo de Seguridad",
            descripcion: "Descripción generada para medir el rendimiento de la consulta de incidentes.",
        });
    }

    return lista;
}

// promedio en milisegundos de varias ejecuciones de la misma consulta
async function promedio(consulta) {
    await consulta();

    const inicio = process.hrtime.bigint();

    for (let i = 0; i < REPETICIONES; i++) {
        await consulta();
    }

    return Number(process.hrtime.bigint() - inicio) / 1e6 / REPETICIONES;
}

// tiempo, tamaño y forma de búsqueda de una consulta
async function medirConsulta(consulta) {
    const tiempo = await promedio(consulta);
    const resultado = await consulta();
    const json = JSON.stringify({ exito: true, total: resultado.length, datos: resultado });

    const [plan] = await sequelize.query(
        "EXPLAIN QUERY PLAN SELECT * FROM incidentes WHERE estado = 'Abierto' AND prioridad = 'Alta' ORDER BY id"
    );

    return {
        encontrados: resultado.length,
        tiempo: tiempo.toFixed(2),
        tamano: (Buffer.byteLength(json) / 1024).toFixed(1),
        comprimido: (zlib.gzipSync(json).length / 1024).toFixed(1),
        indice: plan.map((p) => p.detail).join(" | "),
    };
}

async function medir() {
    await sequelize.sync();

    // antes: los índices originales y todas las columnas
    const consultas = sequelize.getQueryInterface();
    await consultas.addIndex("incidentes", ["estado"]);
    await consultas.addIndex("incidentes", ["prioridad"]);
    await Incidente.bulkCreate(generar(CANTIDAD), { validate: false });

    const antes = await medirConsulta(() =>
        Incidente.findAll({ where: filtro, order: [["id", "ASC"]] })
    );

    // después: índice combinado y solo las columnas del listado, igual que la api
    await consultas.addIndex("incidentes", ["estado", "prioridad"], { name: "incidentes_estado_prioridad" });

    const despues = await medirConsulta(() =>
        Incidente.findAll({ where: filtro, attributes: Incidente.CAMPOS_LISTADO, order: [["id", "ASC"]] })
    );

    console.log(`\nConsulta con ${CANTIDAD} incidentes y el filtro estado Abierto y prioridad Alta\n`);
    console.table({
        "Incidentes encontrados": { Antes: antes.encontrados, Después: despues.encontrados },
        "Tiempo promedio en ms": { Antes: antes.tiempo, Después: despues.tiempo },
        "Tamaño de la respuesta en KB": { Antes: antes.tamano, Después: despues.tamano },
        "Tamaño comprimida en KB": { Antes: antes.comprimido, Después: despues.comprimido },
    });
    console.log("Índice usado antes:  ", antes.indice);
    console.log("Índice usado después:", despues.indice);

    await sequelize.close();
}

medir();
