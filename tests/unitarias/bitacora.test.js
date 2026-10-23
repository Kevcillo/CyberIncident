// bitácora: niveles por estado y datos sensibles ocultos

const { crearBitacora, ocultar } = require("../../config/bitacora");
const { nivelPorEstado } = require("../../middlewares/registro");

function bitacoraDePrueba(formato) {
    const lineas = [];
    const bitacora = crearBitacora({ formato, escribir: (linea, nivel) => lineas.push({ linea, nivel }) });
    return { bitacora, lineas };
}

describe("bitácora del servidor", () => {

    test("el nivel depende del estado de la respuesta", () => {
        expect(nivelPorEstado(200)).toBe("info");
        expect(nivelPorEstado(201)).toBe("info");
        expect(nivelPorEstado(401)).toBe("warn");
        expect(nivelPorEstado(404)).toBe("warn");
        expect(nivelPorEstado(500)).toBe("error");
        expect(nivelPorEstado(503)).toBe("error");
    });

    test("contraseñas, tokens y claves nunca se escriben", () => {
        const limpio = ocultar({
            contrasena: "Admin123!",
            Authorization: "Bearer abc.def.ghi",
            token: "abc.def.ghi",
            JWT_SECRET: "secreto",
            ruta: "/api/incidentes",
        });

        expect(limpio).toEqual({
            contrasena: "[oculto]",
            Authorization: "[oculto]",
            token: "[oculto]",
            JWT_SECRET: "[oculto]",
            ruta: "/api/incidentes",
        });
    });

    test("en producción cada evento es una línea json", () => {
        const { bitacora, lineas } = bitacoraDePrueba("json");

        bitacora.warn("petición", { id: "abc", estado: 404, token: "abc.def.ghi" });

        const entrada = JSON.parse(lineas[0].linea);
        expect(entrada).toMatchObject({ nivel: "WARN", mensaje: "petición", id: "abc", estado: 404, token: "[oculto]" });
        expect(lineas[0].linea).not.toContain("abc.def.ghi");
    });

    test("en desarrollo cada evento es una línea de texto con nivel", () => {
        const { bitacora, lineas } = bitacoraDePrueba("texto");

        bitacora.info("petición", { metodo: "GET", estado: 200 });

        expect(lineas[0].linea).toMatch(/^\[.+\] INFO {2}petición metodo=GET estado=200$/);
    });

    test("cada línea indica su nivel para elegir la salida", () => {
        const { bitacora, lineas } = bitacoraDePrueba("texto");

        bitacora.error("fallo");
        bitacora.info("normal");

        expect(lineas.map((l) => l.nivel)).toEqual(["ERROR", "INFO"]);
    });
});
