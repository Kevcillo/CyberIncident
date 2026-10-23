// indicadores del panel a partir de la lista de incidentes, no tocan la página

export const SEVERIDADES = ["Crítica", "Alta", "Media", "Baja"];

// riesgo de cada incidente según su severidad, escala de splunk
export const RIESGO = { Crítica: 100, Alta: 80, Media: 60, Baja: 40 };

const NOMBRES_MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function porcentaje(parte, total) {
    return total === 0 ? 0 : Math.round((parte / total) * 100);
}

// cantidad y porcentaje de cada severidad sobre el total
export function contarPorSeveridad(incidentes) {
    return SEVERIDADES.map((prioridad) => {
        const cantidad = incidentes.filter((i) => i.prioridad === prioridad).length;
        return { prioridad, cantidad, porcentaje: porcentaje(cantidad, incidentes.length) };
    });
}

// incidentes no cerrados con su riesgo, del más grave al menos grave
export function listarAbiertos(incidentes) {
    return incidentes
        .filter((i) => i.estado !== "Cerrado" && RIESGO[i.prioridad])
        .map((i) => ({
            codigo: i.codigo,
            titulo: i.titulo,
            estado: i.estado,
            prioridad: i.prioridad,
            riesgo: RIESGO[i.prioridad],
        }))
        .sort((a, b) => b.riesgo - a.riesgo);
}

// incidentes registrados en los últimos meses, el último es el mes de hoy
export function contarPorMes(incidentes, { meses = 4, hoy = new Date() } = {}) {
    const lista = [];

    for (let atras = meses - 1; atras >= 0; atras--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - atras, 1);
        const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

        lista.push({ clave, etiqueta: NOMBRES_MES[fecha.getMonth()], cantidad: 0 });
    }

    // la fecha llega como texto aaaa-mm-dd, se compara sin convertir para evitar la zona horaria
    incidentes.forEach((i) => {
        const mes = lista.find((m) => String(i.fecha || "").startsWith(m.clave));

        if (mes) {
            mes.cantidad += 1;
        }
    });

    return lista;
}
