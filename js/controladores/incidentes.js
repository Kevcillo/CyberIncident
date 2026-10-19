// controlador de los incidentes: coordina el modelo y la vista, no toca la página

import { CAMPOS_FORMULARIO, validarCampo, validarIncidente } from "../modelos/reglas.js";

export class ControladorIncidentes {

    constructor(modelo, vista, sesion) {
        this.modelo = modelo;
        this.vista = vista;
        this.sesion = sesion;

        // id del incidente que se está editando, null cuando se registra uno nuevo
        this.editandoId = null;

        this.vista.alCambiarFiltros(() => this.actualizarPantalla());
        this.vista.alVerDetalle((id) => this.verDetalle(id));
        this.vista.alEditar((id) => this.editar(id));
        this.vista.alEliminar((id) => this.eliminar(id));
        this.vista.alCancelarEdicion(() => this.cancelarEdicion());
        this.vista.alEditarCampo((campo, valor) => this.revisarCampo(campo, valor));
        this.vista.alGuardar((datos) => this.guardarIncidente(datos));
    }

    get editando() {
        return this.editandoId !== null;
    }

    // al entrar se prepara el panel y se cargan los datos
    async cargarPanel() {
        this.reiniciar();
        this.vista.modoCreacion();
        this.vista.limpiarDetalle();
        await this.actualizarPantalla({ datosCambiaron: true });
    }

    reiniciar() {
        this.editandoId = null;
    }

    // pide la lista filtrada, el resumen solo se pide de nuevo si los datos cambiaron
    async actualizarPantalla({ datosCambiaron = false } = {}) {
        this.vista.mostrarCargando();

        try {
            const filtros = this.vista.leerFiltros();
            const sinFiltros = Object.values(filtros).every((valor) => !valor);

            const incidentes = await this.modelo.listar(filtros);

            // sin filtros la lista ya está completa y sirve para el resumen
            const resumen = await this.modelo.obtenerResumen({
                listaCompleta: sinFiltros ? incidentes : null,
                actualizar: datosCambiaron,
            });

            this.vista.renderLista(incidentes);
            this.vista.renderResumen(resumen);
            this.vista.ocultarMensajeCarga();
            this.vista.anunciar(`Se cargaron ${incidentes.length} incidentes.`);
        } catch (error) {
            this.manejarError(error, "No se pudieron cargar los incidentes desde el servidor. Intente nuevamente.");
        }
    }

    async verDetalle(id) {
        try {
            const incidente = await this.modelo.obtenerPorId(id);

            this.vista.renderDetalle(incidente, this.sesion.esAdmin());
            this.vista.anunciar(`Mostrando detalle de ${incidente.codigo}`);
        } catch (error) {
            this.manejarError(error);
        }
    }

    async editar(id) {
        try {
            const incidente = await this.modelo.obtenerPorId(id);

            this.editandoId = incidente.id;
            this.vista.modoEdicion(incidente);
        } catch (error) {
            this.manejarError(error);
        }
    }

    cancelarEdicion() {
        this.reiniciar();
        this.vista.modoCreacion();
        this.vista.anunciar("Edición cancelada.");
    }

    async eliminar(id) {
        const incidente = this.modelo.incidentes.find((i) => i.id === id);
        const codigo = incidente ? incidente.codigo : `el incidente ${id}`;

        // eliminar no se puede deshacer, por eso se pide confirmación
        if (!this.vista.confirmarEliminacion(codigo)) {
            return;
        }

        try {
            await this.modelo.eliminar(id);

            if (this.editandoId === id) {
                this.cancelarEdicion();
            }

            this.vista.limpiarDetalle();
            await this.actualizarPantalla({ datosCambiaron: true });
            this.vista.anunciar(`El incidente ${codigo} fue eliminado.`);
        } catch (error) {
            // 403 si el rol no tiene permiso, la api tiene la última palabra
            this.manejarError(error);
        }
    }

    // validación mientras se escribe
    revisarCampo(campo, valor) {
        if (CAMPOS_FORMULARIO.includes(campo)) {
            this.vista.marcarCampo(campo, validarCampo(campo, valor, { editando: this.editando }));
        }
    }

    // registra uno nuevo o guarda los cambios del que se está editando
    async guardarIncidente(datos) {
        this.vista.ocultarMensajeRegistro();

        const errores = validarIncidente(datos, { editando: this.editando });
        this.vista.mostrarErroresFormulario(errores, CAMPOS_FORMULARIO);

        if (Object.keys(errores).length > 0) {
            return;
        }

        const { titulo, tipo, prioridad, fecha, descripcion } = datos;
        const editando = this.editando;
        this.vista.guardando(true);

        try {
            const incidente = editando
                ? await this.modelo.actualizar(this.editandoId, { titulo, tipo, prioridad, fecha, descripcion, estado: datos.estado })
                : await this.modelo.crear({ titulo, tipo, prioridad, fecha, descripcion, reportadoPor: datos.correo });

            this.reiniciar();
            this.vista.modoCreacion();
            this.vista.mostrarRegistroExitoso(
                editando
                    ? `Incidente ${incidente.codigo} actualizado correctamente`
                    : `Incidente ${incidente.codigo} registrado exitosamente`
            );

            await this.actualizarPantalla({ datosCambiaron: true });

            if (editando) {
                this.vista.renderDetalle(incidente, this.sesion.esAdmin());
            }
        } catch (error) {
            if (error.estado === 401) {
                return;
            }

            const accion = editando ? "guardar los cambios" : "registrar el incidente";

            this.vista.mostrarErroresServidor(error.errores || {}, [...CAMPOS_FORMULARIO, "estado"]);
            this.vista.mostrarErrorRegistro(`No se pudo ${accion}. ${error.message}`);
        } finally {
            this.vista.guardando(false);
        }
    }

    // sin sesión ya se mostró el inicio de sesión, el resto se informa en pantalla
    manejarError(error, mensaje) {
        if (error.estado !== 401) {
            this.vista.mostrarError(mensaje || error.message);
        }
    }
}
