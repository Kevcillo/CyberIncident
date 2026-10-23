// indicadores del panel: severidades, incidentes abiertos y registros por mes

import { contarPorSeveridad, listarAbiertos, contarPorMes } from "../../js/modelos/indicadores.js";

const incidente = (prioridad, estado = "Abierto", fecha = "2026-10-01") => ({ prioridad, estado, fecha });

describe("incidentes por severidad", () => {

    test("sin incidentes cada severidad queda en cero", () => {
        expect(contarPorSeveridad([])).toEqual([
            { prioridad: "Crítica", cantidad: 0, porcentaje: 0 },
            { prioridad: "Alta", cantidad: 0, porcentaje: 0 },
            { prioridad: "Media", cantidad: 0, porcentaje: 0 },
            { prioridad: "Baja", cantidad: 0, porcentaje: 0 },
        ]);
    });

    test("cuenta y calcula el porcentaje sobre el total", () => {
        const lista = [incidente("Crítica"), incidente("Alta"), incidente("Alta"), incidente("Baja")];

        expect(contarPorSeveridad(lista).map((s) => [s.cantidad, s.porcentaje])).toEqual([
            [1, 25],
            [2, 50],
            [0, 0],
            [1, 25],
        ]);
    });
});

describe("incidentes abiertos", () => {

    test("los cerrados no aparecen", () => {
        expect(listarAbiertos([incidente("Crítica", "Cerrado"), incidente("Alta", "Cerrado")])).toEqual([]);
    });

    test("cada severidad tiene su riesgo en la escala de splunk", () => {
        const lista = [incidente("Baja"), incidente("Media"), incidente("Alta"), incidente("Crítica")];

        expect(listarAbiertos(lista).map((i) => [i.prioridad, i.riesgo])).toEqual([
            ["Crítica", 100],
            ["Alta", 80],
            ["Media", 60],
            ["Baja", 40],
        ]);
    });

    test("cerrar uno de dos incidentes deja solo el otro en la lista", () => {
        expect(listarAbiertos([incidente("Alta"), incidente("Alta")])).toHaveLength(2);
        expect(listarAbiertos([incidente("Alta"), incidente("Alta", "Cerrado")])).toHaveLength(1);
    });

    test("incluye los que están en investigación con su estado", () => {
        const lista = [
            { codigo: "INC-001", titulo: "Correo", prioridad: "Media", estado: "Abierto" },
            { codigo: "INC-002", titulo: "Acceso", prioridad: "Crítica", estado: "En investigación" },
            { codigo: "INC-003", titulo: "Equipo", prioridad: "Alta", estado: "Cerrado" },
        ];

        expect(listarAbiertos(lista)).toEqual([
            { codigo: "INC-002", titulo: "Acceso", estado: "En investigación", prioridad: "Crítica", riesgo: 100 },
            { codigo: "INC-001", titulo: "Correo", estado: "Abierto", prioridad: "Media", riesgo: 60 },
        ]);
    });
});

describe("incidentes por mes", () => {
    const hoy = new Date(2026, 9, 22);

    test("devuelve los últimos cuatro meses terminando en el actual", () => {
        expect(contarPorMes([], { hoy }).map((m) => m.etiqueta)).toEqual(["jul", "ago", "sep", "oct"]);
    });

    test("cuenta cada incidente en su mes y ignora los que están fuera del rango", () => {
        const lista = [
            incidente("Alta", "Abierto", "2026-09-05"),
            incidente("Baja", "Cerrado", "2026-09-30"),
            incidente("Media", "Abierto", "2026-10-01"),
            incidente("Media", "Abierto", "2025-10-01"),
        ];

        const meses = contarPorMes(lista, { hoy });

        expect(meses.find((m) => m.clave === "2026-09").cantidad).toBe(2);
        expect(meses.find((m) => m.clave === "2026-10").cantidad).toBe(1);
        expect(meses.reduce((suma, m) => suma + m.cantidad, 0)).toBe(3);
    });

    test("cruza el cambio de año", () => {
        const enero = new Date(2027, 0, 10);

        expect(contarPorMes([], { hoy: enero, meses: 3 }).map((m) => m.clave)).toEqual(["2026-11", "2026-12", "2027-01"]);
    });
});
