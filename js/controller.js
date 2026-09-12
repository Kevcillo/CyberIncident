/**
 * CONTROLADOR (C de MVC)
 * -----------------------------------------------------------------------
 * Conecta el Modelo con la Vista: escucha los eventos del usuario
 * (jQuery), aplica las reglas de validación dinámica del formulario y
 * decide qué debe pintarse en cada momento.
 */

export class IncidentController {

    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.$formulario = $("#form-incidente");

        // Reglas de validación por campo (además de los atributos HTML5)
        this.reglas = {
            titulo: (valor) =>
                valor.trim().length >= 5 || "El título debe tener al menos 5 caracteres.",
            tipo: (valor) =>
                valor !== "" || "Debe seleccionar un tipo de incidente.",
            correo: (valor) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) || "Ingrese un correo electrónico válido.",
            fecha: (valor) =>
                valor !== "" || "Debe seleccionar una fecha.",
            descripcion: (valor) =>
                valor.trim().length >= 20 || "La descripción debe tener al menos 20 caracteres.",
        };

        this.bindEventos();
    }

    /** Carga inicial de datos (Fetch API) y primer renderizado. */
    async iniciar() {

        this.view.mostrarCargando();

        try {
            const datos = await this.model.cargarDatos();

            this.view.renderLista(this.model.obtenerTodos());
            this.view.renderResumen(this.model.calcularResumen());
            this.view.ocultarMensajeCarga();

            this.view.anunciar(`Se cargaron ${datos.length} incidentes correctamente.`);

        } catch (error) {
            console.error(error);
            this.view.mostrarError(
                "No se pudieron cargar los incidentes desde el servidor. Intente nuevamente."
            );
        }
    }

    /** Registra los manejadores de eventos (delegados con jQuery). */
    bindEventos() {

        // Ver detalle de un incidente
        $("#lista-incidentes").on("click", "button[data-incidente]", (evento) => {
            const id = $(evento.currentTarget).data("incidente");
            const incidente = this.model.obtenerPorId(id);

            if (!incidente) return;

            this.view.renderDetalle(incidente);
            this.view.anunciar(`Mostrando detalle de ${incidente.titulo}`);
        });

        // Validación dinámica: se valida cada campo mientras el usuario escribe
        this.$formulario
            .find("input, select, textarea")
            .not("[type=radio]")
            .on("input blur change", (evento) => this.validarCampo(evento.target.id));

        this.$formulario.find("[name=prioridad]").on("change", () =>
            this.validarPrioridad()
        );

        // Envío del formulario
        this.$formulario.on("submit", (evento) => this.registrarIncidente(evento));
    }

    /** Valida un campo individual según las reglas definidas arriba. */
    validarCampo(idCampo) {

        const regla = this.reglas[idCampo];
        if (!regla) return true;

        const valor = document.getElementById(idCampo).value;
        const resultado = regla(valor);

        if (resultado === true) {
            this.view.marcarCampoValido(idCampo);
            return true;
        }

        this.view.marcarCampoInvalido(idCampo, resultado);
        return false;
    }

    /** Valida el grupo de radios de prioridad (obligatorio). */
    validarPrioridad() {
        const seleccionado = $("input[name=prioridad]:checked").length > 0;

        if (seleccionado) {
            this.view.marcarCampoValido("prioridad");
            return true;
        }

        this.view.marcarCampoInvalido("prioridad", "Debe seleccionar una prioridad.");
        return false;
    }

    /** Lleva el foco al primer campo marcado como inválido (accesibilidad). */
    enfocarPrimerCampoInvalido(camposAValidar) {

        const primerInvalido = camposAValidar.find(
            (id) => document.getElementById(id).getAttribute("aria-invalid") === "true"
        );

        if (primerInvalido) {
            document.getElementById(primerInvalido).focus();
            return;
        }

        // Si el único error es la prioridad (no tiene un único input con id),
        // se enfoca el primer radio del grupo.
        if (document.getElementById("prioridad").getAttribute("aria-invalid") === "true") {
            document.getElementById("prioridad-baja").focus();
        }
    }

    /** Maneja el envío del formulario: valida, registra y actualiza la vista. */
    registrarIncidente(evento) {

        evento.preventDefault();

        const camposAValidar = ["titulo", "tipo", "correo", "fecha", "descripcion"];

        const resultados = camposAValidar.map((id) => this.validarCampo(id));
        const prioridadValida = this.validarPrioridad();

        const formularioValido = resultados.every(Boolean) && prioridadValida;

        if (!formularioValido) {
            this.view.anunciar("El formulario contiene errores. Revise los campos marcados.");
            this.enfocarPrimerCampoInvalido(camposAValidar);
            return;
        }

        const datosIncidente = {
            titulo: $("#titulo").val().trim(),
            tipo: $("#tipo").val(),
            prioridad: $("input[name=prioridad]:checked").val(),
            correo: $("#correo").val().trim(),
            fecha: $("#fecha").val(),
            descripcion: $("#descripcion").val().trim(),
        };

        const nuevoIncidente = this.model.agregarIncidenteLocal(datosIncidente);

        this.view.renderLista(this.model.obtenerTodos());
        this.view.renderResumen(this.model.calcularResumen());
        this.view.limpiarFormulario(this.$formulario);
        this.view.mostrarRegistroExitoso();

        this.view.anunciar(`El incidente ${nuevoIncidente.id} fue registrado correctamente.`);
    }
}