// íconos svg de las tarjetas del listado, uno por cada valor de tipo, prioridad y estado

const TRAZOS = {
    Phishing: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    Malware: '<rect x="8" y="7" width="8" height="12" rx="4"/><path d="M12 7V4M8 11H4M16 11h4M8 15H5M16 15h3M9.5 4.5l1.5 2.5M14.5 4.5L13 7"/>',
    Intrusión: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.8"/>',
    "Fuga de información": '<ellipse cx="10" cy="6" rx="6" ry="2.5"/><path d="M4 6v10c0 1.4 2.7 2.5 6 2.5M16 6v4M14 15h7M18 12l3 3-3 3"/>',
    Otro: '<circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',

    prioridad: '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',

    Abierto: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>',
    "En investigación": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    Cerrado: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',

    abajo: '<path d="M6 9l6 6 6-6"/>',
    arriba: '<path d="M6 15l6-6 6 6"/>',
};

export function icono(nombre) {
    const trazo = TRAZOS[nombre] || TRAZOS.Otro;
    return `<svg class="icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${trazo}</svg>`;
}
