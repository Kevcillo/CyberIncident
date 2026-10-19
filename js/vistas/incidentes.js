// vista de los incidentes: resumen, listado, detalle y formulario

import { escaparHtml, anunciar, marcarCampoInvalido, marcarCampoValido } from "./comun.js";

// título con su código, por ejemplo INC-001 - Correo sospechoso
function nombre(incidente) {
    return `${incidente.codigo} - ${incidente.titulo}`;
}

// en la api el correo se llama reportadoPor, en el formulario correo
const EQUIVALENCIAS = { reportadoPor: "correo" };

export class VistaIncidentes {

    constructor() {
        this.$mensajeCarga = $("#mensaje-carga");
        this.$mensajeRegistro = $("#mensaje-registro");
        this.$listaIncidentes = $("#lista-incidentes");
        this.$totalFiltrado = $("#total-filtrado");
        this.$detalleContenido = $("#detalle-contenido");

        this.$formulario = $("#form-incidente");
        this.$filtros = $("#form-filtros");
        this.$tituloRegistro = $("#titulo-registro");
        this.$ayudaFormulario = $("#ayuda-formulario");
        this.$botonEnviar = $("#boton-enviar");
        this.$botonCancelar = $("#boton-cancelar");
        this.$grupoEstado = $("#grupo-estado");

        this.$contadorAbiertos = $("#contador-abiertos");
        this.$contadorInvestigacion = $("#contador-investigacion");
        this.$contadorCriticos = $("#contador-criticos");
        this.$contadorCerrados = $("#contador-cerrados");
    }

    // avisos al controlador

    alCambiarFiltros(accion) {
        this.$filtros.on("change", "select", accion);
        // el reset limpia los campos después del evento
        this.$filtros.on("reset", () => setTimeout(accion, 0));
        this.$filtros.on("submit", (evento) => evento.preventDefault());
    }

    alVerDetalle(accion) {
        this.$listaIncidentes.on("click", "button[data-incidente]", (evento) =>
            accion($(evento.currentTarget).data("incidente"))
        );
    }

    alEditar(accion) {
        this.$detalleContenido.on("click", "button[data-editar]", (evento) =>
            accion($(evento.currentTarget).data("editar"))
        );
    }

    alEliminar(accion) {
        this.$detalleContenido.on("click", "button[data-eliminar]", (evento) =>
            accion($(evento.currentTarget).data("eliminar"))
        );
    }

    alCancelarEdicion(accion) {
        this.$botonCancelar.on("click", accion);
    }

    // avisa cada vez que cambia un campo, para validarlo mientras se escribe
    alEditarCampo(accion) {
        this.$formulario
            .find("input, select, textarea")
            .not("[type=radio]")
            .on("input blur change", (evento) => accion(evento.target.id, evento.target.value));

        this.$formulario
            .find("[name=prioridad]")
            .on("change", () => accion("prioridad", this.leerFormulario().prioridad));
    }

    alGuardar(accion) {
        this.$formulario.on("submit", (evento) => {
            evento.preventDefault();
            accion(this.leerFormulario());
        });
    }

    // lectura de la página

    leerFiltros() {
        return {
            tipo: $("#filtro-tipo").val(),
            prioridad: $("#filtro-prioridad").val(),
            estado: $("#filtro-estado").val(),
        };
    }

    leerFormulario() {
        return {
            titulo: $("#titulo").val().trim(),
            tipo: $("#tipo").val(),
            prioridad: $("input[name=prioridad]:checked").val() ?? "",
            estado: $("#estado").val(),
            correo: $("#correo").val().trim(),
            fecha: $("#fecha").val(),
            descripcion: $("#descripcion").val().trim(),
        };
    }

    confirmarEliminacion(codigo) {
        return window.confirm(`¿Eliminar ${codigo}? Esta acción no se puede deshacer.`);
    }

    // estado de carga y mensajes

    mostrarCargando() {
        this.$listaIncidentes.attr("aria-busy", "true");
        this.$mensajeCarga
            .removeClass("error exito")
            .addClass("cargando")
            .text("Cargando incidentes...")
            .show();
    }

    mostrarError(mensaje) {
        this.$listaIncidentes.attr("aria-busy", "false");
        this.$mensajeCarga
            .removeClass("cargando exito")
            .addClass("error")
            .text(mensaje)
            .show();

        anunciar(mensaje);
    }

    ocultarMensajeCarga() {
        this.$mensajeCarga.hide();
    }

    mostrarRegistroExitoso(mensaje) {
        this.$mensajeRegistro
            .removeClass("error")
            .addClass("exito")
            .text(mensaje)
            .removeAttr("hidden");
        anunciar(mensaje);
    }

    mostrarErrorRegistro(mensaje) {
        this.$mensajeRegistro
            .removeClass("exito")
            .addClass("error")
            .text(mensaje)
            .removeAttr("hidden");
    }

    ocultarMensajeRegistro() {
        this.$mensajeRegistro.attr("hidden", true).text("");
    }

    anunciar(mensaje) {
        anunciar(mensaje);
    }

    guardando(activo) {
        this.$botonEnviar.prop("disabled", activo);
    }

    // resumen y listado

    renderResumen(resumen) {
        this.$contadorAbiertos.text(resumen.abiertos);
        this.$contadorInvestigacion.text(resumen.investigacion);
        this.$contadorCriticos.text(resumen.criticos);
        this.$contadorCerrados.text(resumen.cerrados);
    }

    renderLista(incidentes) {

        this.$listaIncidentes.empty();
        const total = incidentes.length;
        this.$totalFiltrado.text(`Mostrando ${total} ${total === 1 ? "incidente" : "incidentes"}.`);

        if (incidentes.length === 0) {
            this.$listaIncidentes.append("<p>No hay incidentes que coincidan con los filtros.</p>");
        }

        incidentes.forEach((incidente) => {

            const $tarjeta = $("<article></article>");

            $tarjeta.append(`<h3>${escaparHtml(nombre(incidente))}</h3>`);
            $tarjeta.append(`<p><strong>Tipo:</strong> ${escaparHtml(incidente.tipo)}</p>`);
            $tarjeta.append(`<p><strong>Prioridad:</strong> ${escaparHtml(incidente.prioridad)}</p>`);
            $tarjeta.append(`<p><strong>Estado:</strong> ${escaparHtml(incidente.estado)}</p>`);
            $tarjeta.append(`<p><strong>Fecha:</strong> ${escaparHtml(incidente.fecha)}</p>`);

            const $boton = $(
                `<button type="button" class="btn btn-primary" data-incidente="${escaparHtml(incidente.id)}"
                    aria-label="Ver detalle de ${escaparHtml(nombre(incidente))}">
                    Ver detalle
                </button>`
            );

            $tarjeta.append($boton);

            this.$listaIncidentes.append($tarjeta);
        });

        this.$listaIncidentes.attr("aria-busy", "false");
    }

    // detalle, los botones dependen del rol y eliminar solo aparece para el administrador

    renderDetalle(incidente, puedeEliminar) {

        const id = escaparHtml(incidente.id);
        const etiqueta = escaparHtml(nombre(incidente));

        const botonEliminar = puedeEliminar
            ? `<button type="button" class="peligro" data-eliminar="${id}" aria-label="Eliminar ${etiqueta}">Eliminar</button>`
            : `<p class="nota-permiso">Solo el administrador puede eliminar incidentes.</p>`;

        this.$detalleContenido.html(`
            <h3>${escaparHtml(nombre(incidente))}</h3>
            <p><strong>Tipo:</strong> ${escaparHtml(incidente.tipo)}</p>
            <p><strong>Prioridad:</strong> ${escaparHtml(incidente.prioridad)}</p>
            <p><strong>Estado:</strong> ${escaparHtml(incidente.estado)}</p>
            <p><strong>Fecha del incidente:</strong> ${escaparHtml(incidente.fecha)}</p>
            <p><strong>Reportado por:</strong> ${escaparHtml(incidente.reportadoPor)}</p>
            <p><strong>Responsable:</strong> ${escaparHtml(incidente.responsable)}</p>
            <h4>Descripción</h4>
            <p>${escaparHtml(incidente.descripcion)}</p>
            <div class="acciones-detalle">
                <button type="button" data-editar="${id}" aria-label="Editar ${etiqueta}">Editar</button>
                ${botonEliminar}
            </div>
        `);

        document.querySelector("#detalle").scrollIntoView({ behavior: "smooth" });
    }

    limpiarDetalle() {
        this.$detalleContenido.html("<p>Seleccione un incidente del listado para ver su detalle.</p>");
    }

    // formulario

    // marca un campo según el resultado de su regla, true o el mensaje de error
    marcarCampo(campo, resultado) {
        if (resultado === true) {
            marcarCampoValido(campo);
        } else {
            marcarCampoInvalido(campo, resultado);
        }
    }

    // marca todos los campos revisados y lleva el foco al primero con error
    mostrarErroresFormulario(errores, campos) {
        campos.forEach((campo) => this.marcarCampo(campo, errores[campo] ?? true));

        const primero = campos.find((campo) => errores[campo]);

        if (primero) {
            // en la prioridad el foco va a su primera opción
            $(primero === "prioridad" ? "#prioridad-baja" : `#${primero}`).trigger("focus");
            anunciar("El formulario contiene errores. Revise los campos marcados.");
        }
    }

    // muestra junto a cada campo los errores que devuelve el servidor
    mostrarErroresServidor(errores, campos) {
        const traducidos = {};

        Object.entries(errores).forEach(([nombreApi, mensaje]) => {
            traducidos[EQUIVALENCIAS[nombreApi] || nombreApi] = mensaje;
        });

        this.mostrarErroresFormulario(traducidos, campos.filter((campo) => traducidos[campo]));
    }

    // llena el formulario con el incidente y lo prepara para guardar cambios
    modoEdicion(incidente) {
        this.limpiarFormulario();
        this.ocultarMensajeRegistro();

        $("#titulo").val(incidente.titulo);
        $("#tipo").val(incidente.tipo);
        $(`input[name=prioridad][value="${incidente.prioridad}"]`).prop("checked", true);
        $("#estado").val(incidente.estado);
        $("#correo").val(incidente.reportadoPor).prop("disabled", true);
        $("#fecha").val(incidente.fecha);
        $("#descripcion").val(incidente.descripcion);

        this.$grupoEstado.removeAttr("hidden");
        this.$tituloRegistro.text(`Editar incidente ${incidente.codigo}`);
        this.$ayudaFormulario.text("Modifique los campos necesarios y guarde los cambios. El correo del reportante no se puede cambiar.");
        this.$botonEnviar.text("Guardar cambios");
        this.$botonCancelar.removeAttr("hidden");

        document.querySelector("#registrar").scrollIntoView({ behavior: "smooth" });
        $("#titulo").trigger("focus");
        anunciar(`Editando ${incidente.codigo}`);
    }

    // vuelve el formulario a su uso normal de registro
    modoCreacion() {
        this.limpiarFormulario();

        $("#correo").prop("disabled", false);
        this.$grupoEstado.attr("hidden", true);
        this.$tituloRegistro.text("Registrar nuevo incidente");
        this.$ayudaFormulario.text("Complete todos los campos obligatorios para registrar un nuevo incidente de ciberseguridad.");
        this.$botonEnviar.text("Registrar incidente");
        this.$botonCancelar.attr("hidden", true);
    }

    limpiarFormulario() {
        this.$formulario[0].reset();
        this.$formulario.find("[aria-invalid]").attr("aria-invalid", "false");
        this.$formulario.find(".error-campo").text("");
    }
}
