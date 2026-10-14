// controlador, une el modelo con la vista y atiende los eventos

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class IncidentController {

    constructor(model, view, sesion) {

        this.model = model;
        this.view = view;
        this.sesion = sesion;

        this.$formulario = $("#form-incidente");
        this.$filtros = $("#form-filtros");
        this.$acceso = $("#form-acceso");

        // id del incidente que se está editando, null cuando se registra uno nuevo
        this.editandoId = null;

        // cada regla devuelve true o el mensaje de error
        this.reglas = {

            titulo: (valor) =>
                valor.trim().length >= 5 ||
                "El título debe tener al menos 5 caracteres.",

            tipo: (valor) =>
                valor !== "" ||
                "Debe seleccionar un tipo de incidente.",

            correo: (valor) =>
                CORREO_VALIDO.test(valor.trim()) ||
                "Ingrese un correo electrónico válido.",

            fecha: (valor) =>
                valor !== "" ||
                "Debe seleccionar una fecha.",

            descripcion: (valor) =>
                valor.trim().length >= 20 ||
                "La descripción debe tener al menos 20 caracteres.",
        };

        // si el token vence en cualquier petición, se vuelve al inicio de sesión
        this.model.alPerderSesion = (mensaje) => this.salir(mensaje);

        this.bindEventos();
    }

    // al abrir la página se revisa si ya hay una sesión válida
    async iniciar() {
        try {
            if (await this.sesion.verificar()) {
                await this.entrar();
            } else {
                this.view.mostrarAcceso();
            }
        } catch (error) {
            console.error(error);
            this.view.mostrarAcceso("No se pudo conectar con el servidor. Intente nuevamente.");
        }
    }

    async entrar() {
        this.editandoId = null;
        this.view.mostrarPanel(this.sesion.usuario);
        this.view.modoCreacion();
        this.view.limpiarDetalle();
        await this.actualizarPantalla();
    }

    salir(mensaje, tipo = "error") {
        this.sesion.cerrar();
        this.editandoId = null;
        this.view.mostrarAcceso(mensaje, tipo);
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

            // sin sesión ya se mostró el inicio de sesión
            if (error.estado === 401) {
                return;
            }

            console.error(error);

            this.view.mostrarError(
                "No se pudieron cargar los incidentes desde el servidor. Intente nuevamente."
            );
        }
    }

    bindEventos() {

        // inicio y cierre de sesión
        this.$acceso.on("submit", (evento) => this.iniciarSesion(evento));
        $("#boton-salir").on("click", () => this.salir("Sesión cerrada correctamente.", "exito"));

        // ver detalle
        $("#lista-incidentes").on(
            "click",
            "button[data-incidente]",
            (evento) => this.verDetalle($(evento.currentTarget).data("incidente"))
        );

        // editar y eliminar desde el detalle
        $("#detalle-contenido").on(
            "click",
            "button[data-editar]",
            (evento) => this.editar($(evento.currentTarget).data("editar"))
        );

        $("#detalle-contenido").on(
            "click",
            "button[data-eliminar]",
            (evento) => this.eliminar($(evento.currentTarget).data("eliminar"))
        );

        $("#boton-cancelar").on("click", () => this.cancelarEdicion());

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
            (evento) => this.guardarIncidente(evento)
        );
    }

    async iniciarSesion(evento) {

        evento.preventDefault();

        const correo = $("#acceso-correo").val().trim();
        const contrasena = $("#acceso-contrasena").val();
        let valido = true;

        if (!CORREO_VALIDO.test(correo)) {
            this.view.marcarCampoInvalido("acceso-correo", "Ingrese un correo electrónico válido.");
            valido = false;
        } else {
            this.view.marcarCampoValido("acceso-correo");
        }

        if (contrasena === "") {
            this.view.marcarCampoInvalido("acceso-contrasena", "Ingrese su contraseña.");
            valido = false;
        } else {
            this.view.marcarCampoValido("acceso-contrasena");
        }

        if (!valido) {
            this.view.anunciar("Revise los campos marcados.");
            return;
        }

        const $boton = this.$acceso.find("button[type=submit]");
        $boton.prop("disabled", true);

        try {

            await this.sesion.iniciar(correo, contrasena);
            await this.entrar();

        } catch (error) {

            this.view.mostrarMensajeAcceso(error.message);
            $("#acceso-contrasena").val("").trigger("focus");

        } finally {

            $boton.prop("disabled", false);
        }
    }

    async verDetalle(id) {
        try {

            const incidente = await this.model.obtenerPorId(id);

            this.view.renderDetalle(incidente, this.sesion.esAdmin());
            this.view.anunciar(`Mostrando detalle de ${incidente.codigo}`);

        } catch (error) {

            if (error.estado !== 401) {
                this.view.mostrarError(error.message);
            }
        }
    }

    async editar(id) {
        try {

            const incidente = await this.model.obtenerPorId(id);

            this.editandoId = incidente.id;
            this.view.modoEdicion(incidente);
            this.view.anunciar(`Editando ${incidente.codigo}`);

        } catch (error) {

            if (error.estado !== 401) {
                this.view.mostrarError(error.message);
            }
        }
    }

    cancelarEdicion() {
        this.editandoId = null;
        this.view.modoCreacion();
        this.view.anunciar("Edición cancelada.");
    }

    async eliminar(id) {

        const incidente = this.model.incidentes.find((i) => i.id === id);
        const codigo = incidente ? incidente.codigo : `el incidente ${id}`;

        // eliminar no se puede deshacer, por eso se pide confirmación
        if (!window.confirm(`¿Eliminar ${codigo}? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {

            await this.model.eliminar(id);

            if (this.editandoId === id) {
                this.cancelarEdicion();
            }

            this.view.limpiarDetalle();
            await this.actualizarPantalla();
            this.view.anunciar(`El incidente ${codigo} fue eliminado.`);

        } catch (error) {

            // 403 si el rol no tiene permiso, la api tiene la última palabra
            if (error.estado !== 401) {
                this.view.mostrarError(error.message);
            }
        }
    }

    validarCampo(idCampo) {

        const regla = this.reglas[idCampo];

        // al editar el correo no se puede cambiar, no hace falta validarlo
        if (!regla || (idCampo === "correo" && this.editandoId !== null)) {
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

    // registra uno nuevo o guarda los cambios del que se está editando
    async guardarIncidente(evento) {

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

        const datos = {
            titulo: $("#titulo").val().trim(),
            tipo: $("#tipo").val(),
            prioridad: $("input[name=prioridad]:checked").val(),
            fecha: $("#fecha").val(),
            descripcion: $("#descripcion").val().trim(),
        };

        const editando = this.editandoId !== null;
        const $boton = $("#boton-enviar");
        $boton.prop("disabled", true);

        try {

            let incidente;

            if (editando) {
                incidente = await this.model.actualizar(this.editandoId, { ...datos, estado: $("#estado").val() });
            } else {
                incidente = await this.model.crear({ ...datos, reportadoPor: $("#correo").val().trim() });
            }

            const mensaje = editando
                ? `Incidente ${incidente.codigo} actualizado correctamente`
                : `Incidente ${incidente.codigo} registrado exitosamente`;

            this.editandoId = null;
            this.view.modoCreacion();
            this.view.mostrarRegistroExitoso(mensaje);
            this.view.anunciar(mensaje);

            await this.actualizarPantalla();

            if (editando) {
                this.view.renderDetalle(incidente, this.sesion.esAdmin());
            }

        } catch (error) {

            if (error.estado === 401) {
                return;
            }

            console.error(error);

            const accion = editando ? "guardar los cambios" : "registrar el incidente";

            this.mostrarErroresServidor(error.errores || {});
            this.view.mostrarErrorRegistro(`No se pudo ${accion}. ${error.message}`);
            this.view.anunciar(`No se pudo ${accion}.`);

        } finally {

            $boton.prop("disabled", false);
        }
    }
}
