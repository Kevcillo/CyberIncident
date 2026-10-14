// modelo del navegador, se comunica con la api usando fetch y el token de la sesión

export class IncidentModel {

    constructor(urlApi, sesion) {
        this.urlApi = urlApi;
        this.sesion = sesion;
        this.incidentes = [];

        // el controlador decide qué hacer cuando la sesión deja de ser válida
        this.alPerderSesion = () => {};
    }

    // hace la petición con el token y devuelve la respuesta json o lanza un error
    async peticion(url, opciones = {}) {
        const cabeceras = { ...(opciones.headers || {}) };

        if (this.sesion.token) {
            cabeceras.Authorization = `Bearer ${this.sesion.token}`;
        }

        const respuesta = await fetch(url, { ...opciones, headers: cabeceras });
        const cuerpo = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            const error = new Error(cuerpo.mensaje || `Error HTTP ${respuesta.status}`);
            error.estado = respuesta.status;
            error.errores = cuerpo.errores || {};

            // token vencido o inválido, hay que volver a iniciar sesión
            if (respuesta.status === 401) {
                this.sesion.cerrar();
                this.alPerderSesion(error.message);
            }

            throw error;
        }

        return cuerpo;
    }

    // lista incidentes, los filtros vacíos se ignoran
    async listar(filtros = {}) {
        const parametros = new URLSearchParams();

        Object.entries(filtros).forEach(([campo, valor]) => {
            if (valor) {
                parametros.append(campo, valor);
            }
        });

        const consulta = parametros.toString();
        const url = consulta ? `${this.urlApi}?${consulta}` : this.urlApi;
        const { datos } = await this.peticion(url);

        this.incidentes = datos;

        return datos;
    }

    async obtenerPorId(id) {
        const { datos } = await this.peticion(`${this.urlApi}/${encodeURIComponent(id)}`);
        return datos;
    }

    async crear(datosIncidente) {
        const { datos } = await this.peticion(this.urlApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosIncidente),
        });

        return datos;
    }

    // cambia solo los campos enviados
    async actualizar(id, cambios) {
        const { datos } = await this.peticion(`${this.urlApi}/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cambios),
        });

        return datos;
    }

    async eliminar(id) {
        const { datos } = await this.peticion(`${this.urlApi}/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });

        return datos;
    }

    // contadores calculados sobre todos los incidentes, sin filtros
    async calcularResumen() {
        const { datos: todos } = await this.peticion(this.urlApi);

        return {
            abiertos: todos.filter((i) => i.estado === "Abierto").length,
            investigacion: todos.filter((i) => i.estado === "En investigación").length,
            criticos: todos.filter((i) => i.prioridad === "Crítica").length,
            cerrados: todos.filter((i) => i.estado === "Cerrado").length,
        };
    }
}
