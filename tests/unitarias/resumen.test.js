// regla de negocio de la página: los contadores del resumen

import { calcularResumen } from "../../js/modelos/incidentes.js";

const incidente = (estado, prioridad) => ({ estado, prioridad });

describe("resumen del panel", () => {

    test("sin incidentes todos los contadores son cero", () => {
        expect(calcularResumen([])).toEqual({ abiertos: 0, investigacion: 0, criticos: 0, cerrados: 0 });
    });

    test("cuenta cada incidente según su estado", () => {
        const lista = [
            incidente("Abierto", "Alta"),
            incidente("Abierto", "Baja"),
            incidente("En investigación", "Media"),
            incidente("Cerrado", "Baja"),
        ];

        expect(calcularResumen(lista)).toEqual({ abiertos: 2, investigacion: 1, criticos: 0, cerrados: 1 });
    });

    test("los críticos se cuentan sin importar su estado", () => {
        const lista = [
            incidente("Abierto", "Crítica"),
            incidente("Cerrado", "Crítica"),
            incidente("En investigación", "Alta"),
        ];

        expect(calcularResumen(lista).criticos).toBe(2);
    });

    test("un estado desconocido no se suma a ningún contador", () => {
        const resumen = calcularResumen([incidente("Archivado", "Baja")]);

        expect(resumen.abiertos + resumen.investigacion + resumen.cerrados).toBe(0);
    });
});
