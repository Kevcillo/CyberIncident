// modelo del navegador, se comunica con la api usando fetch

export class IncidentModel {

    constructor(urlApi) {
        this.urlApi = urlApi;
        this.incidentes = [];
    }

    // hace la petición y devuelve la respuesta json o lanza un error
    async peticion(url, opciones = {}) {
        const respuesta = await fetch(url, opciones);
        const cuerpo = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            const error = new Error(cuerpo.mensaje || `Error HTTP ${respuesta.status}`);
            error.errores = cuerpo.errores || {};
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
