// vista, todo lo que se pinta en la página

// título con su código, por ejemplo INC-001 - Correo sospechoso
function nombre(incidente) {
    return `${incidente.codigo} - ${incidente.titulo}`;
}

// evita que el texto escrito por el usuario se interprete como html
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
        this.$totalFiltrado = $("#total-filtrado");
        this.$detalleContenido = $("#detalle-contenido");
        this.$anunciosAria = $("#anuncios-aria");

        this.$acceso = $("#acceso");
        this.$mensajeAcceso = $("#mensaje-acceso");
        this.$panel = $("main, nav");
        this.$usuarioSesion = $("#usuario-sesion");

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

    // pantalla de inicio de sesión, oculta todo el panel
    mostrarAcceso(mensaje, tipo = "error") {
        this.$panel.attr("hidden", true);
        this.$usuarioSesion.attr("hidden", true);
        this.$acceso.removeAttr("hidden");
        $("#form-acceso")[0].reset();

        if (mensaje) {
            this.mostrarMensajeAcceso(mensaje, tipo);
        } else {
            this.ocultarMensajeAcceso();
        }

        $("#acceso-correo").trigger("focus");
    }

    // panel de incidentes con el nombre y rol del usuario
    mostrarPanel(usuario) {
        this.$acceso.attr("hidden", true);
        this.$panel.removeAttr("hidden");
        this.ocultarMensajeAcceso();

        $("#usuario-nombre").text(usuario.nombre);
        $("#usuario-rol").text(usuario.rol);
        this.$usuarioSesion.removeAttr("hidden");

        $("#titulo-resumen").attr("tabindex", "-1").trigger("focus");
    }

    // tipo es error o exito, cambia el color del aviso
    mostrarMensajeAcceso(mensaje, tipo = "error") {
        this.$mensajeAcceso
            .removeClass("error exito")
            .addClass(tipo)
            .text(mensaje)
            .removeAttr("hidden");
        this.anunciar(mensaje);
    }

    ocultarMensajeAcceso() {
        this.$mensajeAcceso.attr("hidden", true).text("");
    }

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

        this.anunciar(mensaje);
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

    // aviso para lectores de pantalla
    anunciar(mensaje) {
        this.$anunciosAria.text("");
        // la pausa hace que se lea aunque el mensaje se repita
        setTimeout(() => this.$anunciosAria.text(mensaje), 50);
    }

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

    // los botones dependen del rol, eliminar solo aparece para el administrador
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

    // llena el formulario con el incidente y lo prepara para guardar cambios
    modoEdicion(incidente) {
        const $formulario = $("#form-incidente");
        this.limpiarFormulario($formulario);
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
    }

    // vuelve el formulario a su uso normal de registro
    modoCreacion() {
        this.limpiarFormulario($("#form-incidente"));

        $("#correo").prop("disabled", false);
        this.$grupoEstado.attr("hidden", true);
        this.$tituloRegistro.text("Registrar nuevo incidente");
        this.$ayudaFormulario.text("Complete todos los campos obligatorios para registrar un nuevo incidente de ciberseguridad.");
        this.$botonEnviar.text("Registrar incidente");
        this.$botonCancelar.attr("hidden", true);
    }

    marcarCampoInvalido(idCampo, mensaje) {
        $(`#${idCampo}`).attr("aria-invalid", "true");
        $(`#error-${idCampo}`).text(mensaje);
    }

    marcarCampoValido(idCampo) {
        $(`#${idCampo}`).attr("aria-invalid", "false");
        $(`#error-${idCampo}`).text("");
    }

    limpiarFormulario($formulario) {
        $formulario[0].reset();
        $formulario.find("[aria-invalid]").attr("aria-invalid", "false");
        $formulario.find(".error-campo").text("");
    }
}
