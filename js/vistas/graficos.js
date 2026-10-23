// gráficos del panel en svg, sin librerías; los números llegan calculados del modelo

import { escaparHtml } from "./comun.js";
import { RIESGO } from "../modelos/indicadores.js";

// clase de color de cada severidad
const CLASE_SEVERIDAD = { Crítica: "critica", Alta: "alta", Media: "media", Baja: "baja" };

// anillos: cada uno muestra la parte de su severidad sobre el total
export function renderSeveridades(severidades) {
    const anillos = severidades.map(({ prioridad, cantidad, porcentaje }) => `
        <li>
            <svg viewBox="0 0 80 80" aria-hidden="true" focusable="false">
                <circle class="pista" cx="40" cy="40" r="32" pathLength="100"></circle>
                <circle class="trazo ${CLASE_SEVERIDAD[prioridad]}" cx="40" cy="40" r="32" pathLength="100"
                    stroke-dasharray="${porcentaje} 100" transform="rotate(-90 40 40)"></circle>
                <text x="40" y="40">${cantidad}</text>
            </svg>
            <span class="nombre">${escaparHtml(prioridad)}</span>
            <span class="porcentaje">${porcentaje} %</span>
            <span class="sr-only">, ${cantidad} ${cantidad === 1 ? "incidente" : "incidentes"}</span>
        </li>
    `);

    $("#anillos-severidad").html(anillos.join(""));

    renderEscala();
}

// escala fija de riesgo por severidad, sale de la misma tabla que usa la lista de abiertos
function renderEscala() {
    $("#escala-riesgo").html(
        Object.entries(RIESGO).map(([severidad, riesgo]) => `
            <li class="${CLASE_SEVERIDAD[severidad]}">
                <span class="punto" aria-hidden="true"></span>
                <span class="nombre">${severidad}</span>
                <span class="pista-escala" aria-hidden="true"><span style="width: ${riesgo}%"></span></span>
                <span class="valor">${riesgo} %</span>
            </li>`).join("")
    );
}

// cada incidente no cerrado con su estado y su riesgo, del más grave al menos grave
export function renderAbiertos(abiertos) {
    $("#lista-abiertos").html(
        abiertos.length === 0
            ? "<li class=\"vacio\">No hay incidentes abiertos.</li>"
            : abiertos.map((i) => `
                <li class="${CLASE_SEVERIDAD[i.prioridad]}">
                    <div>
                        <span class="codigo">${escaparHtml(i.codigo)}</span>
                        <span class="titulo" title="${escaparHtml(i.titulo)}">${escaparHtml(i.titulo)}</span>
                        <span class="estado">${escaparHtml(i.estado)}</span>
                    </div>
                    <span class="severidad">
                        <span class="punto" aria-hidden="true"></span>
                        ${escaparHtml(i.prioridad)} · ${i.riesgo} %
                    </span>
                </li>`).join("")
    );
}

// barras por mes, el valor va sobre las barras con datos y la tabla tiene todos
export function renderMeses(meses) {
    const ancho = 320;
    const alto = 190;
    const base = 158;
    const techo = 22;
    const paso = ancho / meses.length;
    const grosor = Math.min(34, paso * 0.45);
    const mayor = Math.max(1, ...meses.map((m) => m.cantidad));

    const barras = meses.map(({ etiqueta, cantidad }, indice) => {
        const centro = paso * indice + paso / 2;
        const altura = cantidad === 0 ? 0 : Math.max(6, ((base - techo) * cantidad) / mayor);
        const x = centro - grosor / 2;
        const y = base - altura;
        const radio = Math.min(6, altura);

        // solo las esquinas de arriba van redondeadas, la barra apoya en la base
        const barra = altura === 0 ? "" : `
            <path class="barra" d="M ${x} ${base} V ${y + radio} Q ${x} ${y} ${x + radio} ${y}
                H ${x + grosor - radio} Q ${x + grosor} ${y} ${x + grosor} ${y + radio} V ${base} Z"></path>`;

        return `
            <g>
                <title>${etiqueta}: ${cantidad} ${cantidad === 1 ? "incidente" : "incidentes"}</title>
                <rect class="zona" x="${paso * indice}" y="0" width="${paso}" height="${alto}"></rect>
                ${barra}
                ${altura === 0 ? "" : `<text class="cantidad" x="${centro}" y="${y - 6}">${cantidad}</text>`}
                <text class="mes" x="${centro}" y="${alto - 10}">${etiqueta}</text>
            </g>`;
    });

    const total = meses.reduce((suma, m) => suma + m.cantidad, 0);

    // líneas guía en la mitad y en el máximo
    const guias = [mayor / 2, mayor].map((nivel) => {
        const y = base - ((base - techo) * nivel) / mayor;
        return `<line class="guia" x1="0" y1="${y}" x2="${ancho}" y2="${y}"></line>`;
    });

    $("#barras-meses").html(`
        <svg viewBox="0 0 ${ancho} ${alto}" role="img"
            aria-label="Incidentes registrados por mes, ${total} en los últimos ${meses.length} meses">
            <defs>
                <linearGradient id="degradado-barras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" class="degradado-arriba"></stop>
                    <stop offset="1" class="degradado-abajo"></stop>
                </linearGradient>
            </defs>
            ${guias.join("")}
            <line class="eje" x1="0" y1="${base}" x2="${ancho}" y2="${base}"></line>
            ${barras.join("")}
        </svg>
    `);

    // el mes más reciente primero
    $("#tabla-meses tbody").html(
        [...meses].reverse().map((m) => `<tr><td>${m.etiqueta} ${m.clave.slice(0, 4)}</td><td>${m.cantidad}</td></tr>`).join("")
    );
}
