/**
 * VISTA (V de MVC)
 * -----------------------------------------------------------------------
 * Responsable de TODO lo que toca el DOM: pintar tarjetas, actualizar el
 * resumen, mostrar el detalle, marcar errores de campos y anunciar
 * mensajes a los lectores de pantalla mediante regiones ARIA (aria-live).
 *
 * Usa jQuery para la manipulación del DOM (selección, creación de
 * elementos, eventos delegados se registran desde el Controlador).
 *
 * La Vista no decide reglas de negocio: solo dibuja lo que el
 * Controlador le indica.
 */

/**
 * Escapa texto de origen no confiable (campos libres del formulario:
 * título, descripción, correo) antes de insertarlo como HTML, para
 * evitar inyección de código (XSS) en las tarjetas y el detalle.
 */
function escaparHtml(texto) {
    const contenedor = document.createElement("div");
    contenedor.textContent = String(texto ?? "");
    return contenedor.innerHTML;
}

export class IncidentView {

    constructor() {
        this.$mensajeCarga = $("#mensaje-carga");
        this.$mensajeRegistro = $("#mensaje-registro");
        this.$listaIncidentes = $("#lista-incidentes");
        this.$detalleContenido = $("#detalle-contenido");
        this.$anunciosAria = $("#anuncios-aria");

        this.$contadorAbiertos = $("#contador-abiertos");
        this.$contadorInvestigacion = $("#contador-investigacion");
        this.$contadorCriticos = $("#contador-criticos");
        this.$contadorCerrados = $("#contador-cerrados");
    }

    /** Muestra el mensaje de "Cargando..." mientras responde el Fetch. */
    mostrarCargando() {
        this.$mensajeCarga
            .removeClass("error exito")
            .addClass("cargando")
            .text("Cargando incidentes...")
            .show();
    }

    /** Muestra un mensaje de error (por ejemplo si falla el Fetch). */
    mostrarError(mensaje) {
        this.$mensajeCarga
            .removeClass("cargando exito")
            .addClass("error")
            .text(mensaje)
            .show();

        this.anunciar(mensaje);
    }

    /** Oculta el mensaje de estado de carga cuando todo salió bien. */
    ocultarMensajeCarga() {
        this.$mensajeCarga.hide();
    }

    /** Muestra confirmación visible después de registrar un incidente. */
    mostrarRegistroExitoso() {
        this.$mensajeRegistro
            .text("Incidente registrado exitosamente")
            .removeAttr("hidden");
    }

    /** Publica un texto en la región ARIA live para lectores de pantalla. */
    anunciar(mensaje) {
        this.$anunciosAria.text("");
        // Pequeño retraso para forzar que los lectores de pantalla
        // detecten el cambio aunque el mensaje sea igual al anterior.
        setTimeout(() => this.$anunciosAria.text(mensaje), 50);
    }

    /** Pinta el resumen numérico de incidentes. */
    renderResumen(resumen) {
        this.$contadorAbiertos.text(resumen.abiertos);
        this.$contadorInvestigacion.text(resumen.investigacion);
        this.$contadorCriticos.text(resumen.criticos);
        this.$contadorCerrados.text(resumen.cerrados);
    }

    /** Construye y muestra las tarjetas del listado de incidentes. */
    renderLista(incidentes) {

        this.$listaIncidentes.empty();

        incidentes.forEach((incidente) => {

            const $tarjeta = $("<article></article>");

            // titulo viene de datos base o del formulario (texto libre):
            // se escapa antes de insertarlo como HTML.
            $tarjeta.append(`<h3>${escaparHtml(incidente.titulo)}</h3>`);
            $tarjeta.append(`<p><strong>Tipo:</strong> ${escaparHtml(incidente.tipo)}</p>`);
            $tarjeta.append(`<p><strong>Prioridad:</strong> ${escaparHtml(incidente.prioridad)}</p>`);
            $tarjeta.append(`<p><strong>Estado:</strong> ${escaparHtml(incidente.estado)}</p>`);
            $tarjeta.append(`<p><strong>Fecha:</strong> ${escaparHtml(incidente.fecha)}</p>`);

            const $boton = $(
                `<button type="button" class="btn btn-primary" data-incidente="${escaparHtml(incidente.id)}"
                    aria-label="Ver detalle de ${escaparHtml(incidente.titulo)}">
                    Ver detalle
                </button>`
            );

            $tarjeta.append($boton);

            this.$listaIncidentes.append($tarjeta);
        });

        this.$listaIncidentes.attr("aria-busy", "false");
    }

    /** Pinta el detalle completo de un incidente seleccionado. */
    renderDetalle(incidente) {

        this.$detalleContenido.html(`
            <h3>${escaparHtml(incidente.titulo)}</h3>
            <p><strong>Tipo:</strong> ${escaparHtml(incidente.tipo)}</p>
            <p><strong>Prioridad:</strong> ${escaparHtml(incidente.prioridad)}</p>
            <p><strong>Estado:</strong> ${escaparHtml(incidente.estado)}</p>
            <p><strong>Fecha del incidente:</strong> ${escaparHtml(incidente.fecha)}</p>
            <p><strong>Reportado por:</strong> ${escaparHtml(incidente.reportadoPor)}</p>
            <p><strong>Responsable:</strong> ${escaparHtml(incidente.responsable)}</p>
            <h4>Descripción</h4>
            <p>${escaparHtml(incidente.descripcion)}</p>
            <p><strong>Última actualización:</strong> ${escaparHtml(incidente.fecha)}</p>
        `);

        document.querySelector("#detalle").scrollIntoView({ behavior: "smooth" });
    }

    /** Marca un campo como inválido y muestra su mensaje de error (ARIA). */
    marcarCampoInvalido(idCampo, mensaje) {
        const $campo = $(`#${idCampo}`);
        const $error = $(`#error-${idCampo}`);

        $campo.attr("aria-invalid", "true");
        $error.text(mensaje);
    }

    /** Marca un campo como válido y limpia su mensaje de error. */
    marcarCampoValido(idCampo) {
        const $campo = $(`#${idCampo}`);
        const $error = $(`#error-${idCampo}`);

        $campo.attr("aria-invalid", "false");
        $error.text("");
    }

    /** Limpia el formulario y todos los estados de validación visual. */
    limpiarFormulario($formulario) {
        $formulario[0].reset();
        $formulario.find("[aria-invalid]").attr("aria-invalid", "false");
        $formulario.find(".error-campo").text("");
    }
}