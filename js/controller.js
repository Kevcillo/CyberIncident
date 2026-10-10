// controlador, une el modelo con la vista y atiende los eventos

export class IncidentController {

    constructor(model, view) {

        this.model = model;
        this.view = view;

        this.$formulario = $("#form-incidente");
        this.$filtros = $("#form-filtros");

        // cada regla devuelve true o el mensaje de error
        this.reglas = {

            titulo: (valor) =>
                valor.trim().length >= 5 ||
                "El título debe tener al menos 5 caracteres.",

            tipo: (valor) =>
                valor !== "" ||
                "Debe seleccionar un tipo de incidente.",

            correo: (valor) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()) ||
                "Ingrese un correo electrónico válido.",

            fecha: (valor) =>
                valor !== "" ||
                "Debe seleccionar una fecha.",

            descripcion: (valor) =>
                valor.trim().length >= 20 ||
                "La descripción debe tener al menos 20 caracteres.",
        };

        this.bindEventos();
    }

    async iniciar() {
        await this.actualizarPantalla();
    }

    leerFiltros() {
        return {
            tipo: $("#filtro-tipo").val(),
            prioridad: $("#filtro-prioridad").val(),
            estado: $("#filtro-estado").val(),
        };
    }

    // vuelve a pedir la lista filtrada y el resumen
    async actualizarPantalla() {

        this.view.mostrarCargando();

        try {

            const [incidentes, resumen] = await Promise.all([
                this.model.listar(this.leerFiltros()),
                this.model.calcularResumen(),
            ]);

            this.view.renderLista(incidentes);
            this.view.renderResumen(resumen);
            this.view.ocultarMensajeCarga();

            this.view.anunciar(`Se cargaron ${incidentes.length} incidentes.`);

        } catch (error) {

            console.error(error);

            this.view.mostrarError(
                "No se pudieron cargar los incidentes desde el servidor. Intente nuevamente."
            );
        }
    }

    bindEventos() {

        // ver detalle
        $("#lista-incidentes").on(
            "click",
            "button[data-incidente]",
            async (evento) => {

                const id = $(evento.currentTarget).data("incidente");

                try {

                    const incidente = await this.model.obtenerPorId(id);

                    this.view.renderDetalle(incidente);
                    this.view.anunciar(`Mostrando detalle de ${incidente.codigo}`);

                } catch (error) {

                    this.view.mostrarError(error.message);
                }
            }
        );

        // filtros
        this.$filtros.on("change", "select", () => this.actualizarPantalla());

        this.$filtros.on("reset", () => {
            // el reset limpia los campos después del evento
            setTimeout(() => this.actualizarPantalla(), 0);
        });

        this.$filtros.on("submit", (evento) => evento.preventDefault());

        // validación mientras se escribe
        this.$formulario
            .find("input, select, textarea")
            .not("[type=radio]")
            .on(
                "input blur change",
                (evento) => this.validarCampo(evento.target.id)
            );

        this.$formulario
            .find("[name=prioridad]")
            .on("change", () => this.validarPrioridad());

        this.$formulario.on(
            "submit",
            (evento) => this.registrarIncidente(evento)
        );
    }

    validarCampo(idCampo) {

        const regla = this.reglas[idCampo];

        if (!regla) {
            return true;
        }

        const resultado = regla(document.getElementById(idCampo).value);

        if (resultado === true) {
            this.view.marcarCampoValido(idCampo);
            return true;
        }

        this.view.marcarCampoInvalido(idCampo, resultado);

        return false;
    }

    validarPrioridad() {

        if ($("input[name=prioridad]:checked").length > 0) {
            this.view.marcarCampoValido("prioridad");
            return true;
        }

        this.view.marcarCampoInvalido("prioridad", "Debe seleccionar una prioridad.");

        return false;
    }

    enfocarPrimerCampoInvalido(camposAValidar) {

        const primerInvalido = camposAValidar.find(
            (id) => document.getElementById(id).getAttribute("aria-invalid") === "true"
        );

        if (primerInvalido) {
            document.getElementById(primerInvalido).focus();
            return;
        }

        if (document.getElementById("prioridad").getAttribute("aria-invalid") === "true") {
            document.getElementById("prioridad-baja").focus();
        }
    }

    // muestra en cada campo los errores que devuelve el servidor
    mostrarErroresServidor(errores) {

        // en la api el correo se llama reportadoPor
        const equivalencias = { reportadoPor: "correo" };

        Object.entries(errores).forEach(([nombre, mensaje]) => {
            const campo = equivalencias[nombre] || nombre;

            if (document.getElementById(campo)) {
                this.view.marcarCampoInvalido(campo, mensaje);
            }
        });

        this.enfocarPrimerCampoInvalido(Object.keys(this.reglas));
    }

    async registrarIncidente(evento) {

        evento.preventDefault();

        this.view.ocultarMensajeRegistro();

        const camposAValidar = Object.keys(this.reglas);
        const resultados = camposAValidar.map((id) => this.validarCampo(id));
        const prioridadValida = this.validarPrioridad();

        if (!resultados.every(Boolean) || !prioridadValida) {

            this.view.anunciar("El formulario contiene errores. Revise los campos marcados.");
            this.enfocarPrimerCampoInvalido(camposAValidar);

            return;
        }

        const datosIncidente = {
            titulo: $("#titulo").val().trim(),
            tipo: $("#tipo").val(),
            prioridad: $("input[name=prioridad]:checked").val(),
            reportadoPor: $("#correo").val().trim(),
            fecha: $("#fecha").val(),
            descripcion: $("#descripcion").val().trim(),
        };

        const $boton = this.$formulario.find("button[type=submit]");
        $boton.prop("disabled", true);

        try {

            const nuevo = await this.model.crear(datosIncidente);

            this.view.limpiarFormulario(this.$formulario);
            this.view.mostrarRegistroExitoso(nuevo.codigo);
            this.view.anunciar(`El incidente ${nuevo.codigo} fue registrado correctamente.`);

            await this.actualizarPantalla();

        } catch (error) {

            console.error(error);

            this.mostrarErroresServidor(error.errores || {});
            this.view.mostrarErrorRegistro(`No se pudo registrar el incidente. ${error.message}`);
            this.view.anunciar("No se pudo registrar el incidente.");

        } finally {

            $boton.prop("disabled", false);
        }
    }
}
