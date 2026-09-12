/**
 * MODELO (M de MVC)
 * -----------------------------------------------------------------------
 * Responsable de obtener y exponer los datos de los incidentes.
 *
 * - Los incidentes "base" se obtienen mediante Fetch API desde un archivo
 *   JSON externo (data/incidentes.json) y se congelan con Object.freeze,
 *   de manera que constituyen un MODELO LOCAL DE SOLO LECTURA: ninguna
 *   otra parte de la aplicación puede modificar esos objetos.
 * - Los incidentes que el usuario registra desde el formulario se
 *   almacenan aparte, en memoria (solo durante la sesión del navegador),
 *   sin alterar el archivo JSON original.
 *
 * El Modelo no conoce el DOM ni jQuery: solo maneja datos.
 */

export class IncidentModel {

    constructor(urlDatos) {
        this.urlDatos = urlDatos;
        this.incidentesBase = [];   // Datos de solo lectura (Fetch + JSON)
        this.incidentesLocales = []; // Incidentes creados en el formulario (runtime)
    }

    /**
     * Descarga el JSON de incidentes usando Fetch API (async/await).
     * Devuelve una promesa con el arreglo de incidentes cargados.
     */
    async cargarDatos() {

        const respuesta = await fetch(this.urlDatos);

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo obtener el archivo de incidentes (HTTP ${respuesta.status}).`
            );
        }

        const datos = await respuesta.json();

        // Se congela cada incidente para garantizar que el modelo base
        // permanezca de solo lectura durante toda la ejecución.
        this.incidentesBase = datos.map((incidente) => Object.freeze({ ...incidente }));

        return this.incidentesBase;
    }

    /** Devuelve todos los incidentes (base + agregados localmente). */
    obtenerTodos() {
        return [...this.incidentesBase, ...this.incidentesLocales];
    }

    /** Busca un incidente por su identificador (INC-XXX). */
    obtenerPorId(id) {
        return this.obtenerTodos().find((incidente) => incidente.id === id);
    }

    /**
     * Agrega un incidente nuevo SOLO en memoria (no modifica el JSON,
     * que se mantiene siempre como fuente de solo lectura).
     */
    agregarIncidenteLocal(datosIncidente) {

        const nuevoId = `INC-${String(this.obtenerTodos().length + 1).padStart(3, "0")}`;

        const nuevoIncidente = Object.freeze({
            id: nuevoId,
            titulo: `${nuevoId} - ${datosIncidente.titulo}`,
            tipo: datosIncidente.tipo,
            prioridad: datosIncidente.prioridad,
            estado: "Abierto",
            fecha: datosIncidente.fecha,
            reportadoPor: datosIncidente.correo,
            responsable: "Equipo de Seguridad",
            descripcion: datosIncidente.descripcion,
        });

        this.incidentesLocales.push(nuevoIncidente);

        return nuevoIncidente;
    }

    /** Calcula los contadores del resumen a partir del estado actual. */
    calcularResumen() {

        const todos = this.obtenerTodos();

        return {
            abiertos: todos.filter((i) => i.estado === "Abierto").length,
            investigacion: todos.filter((i) => i.estado === "En investigación").length,
            criticos: todos.filter((i) => i.prioridad === "Crítica").length,
            cerrados: todos.filter((i) => i.estado === "Cerrado").length,
        };
    }
}
