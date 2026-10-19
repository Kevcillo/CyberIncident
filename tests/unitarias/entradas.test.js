// reglas de negocio: los datos se limpian y solo se aceptan los campos permitidos

const { limpieza, limpiarTexto } = require("../../middlewares/limpieza");
const validarCuerpo = require("../../middlewares/validacion");
const { DatosInvalidos } = require("../../errors/errores");

describe("limpieza de textos", () => {

    test("quita las etiquetas html y conserva el texto", () => {
        expect(limpiarTexto("Correo <b>falso</b>")).toBe("Correo falso");
    });

    test("quita los bloques de código completos", () => {
        expect(limpiarTexto("<script>alert('x')</script>Hola")).toBe("Hola");
        expect(limpiarTexto("<style>body{}</style>Hola")).toBe("Hola");
    });

    test("quita caracteres invisibles pero conserva los saltos de línea", () => {
        expect(limpiarTexto("Hola\u0007\nmundo")).toBe("Hola\nmundo");
    });

    test("quita los espacios del inicio y del final", () => {
        expect(limpiarTexto("   Equipo Azul   ")).toBe("Equipo Azul");
    });

    test("un texto normal no cambia", () => {
        expect(limpiarTexto("Intrusión en el servidor de correo")).toBe("Intrusión en el servidor de correo");
    });

    test("la contraseña no se limpia, puede tener cualquier símbolo", () => {
        const req = { body: { titulo: " <b>Hola</b> ", contrasena: "<Clave>123!" } };

        limpieza(req, {}, jest.fn());

        expect(req.body.titulo).toBe("Hola");
        expect(req.body.contrasena).toBe("<Clave>123!");
    });

    test("un cuerpo en forma de lista se rechaza", () => {
        expect(() => limpieza({ body: [1, 2] }, {}, jest.fn())).toThrow(DatosInvalidos);
    });
});

describe("campos permitidos", () => {

    const validar = validarCuerpo(["titulo", "estado"]);

    test("acepta los campos permitidos", () => {
        const siguiente = jest.fn();

        validar({ body: { titulo: "Prueba", estado: "Abierto" } }, {}, siguiente);

        expect(siguiente).toHaveBeenCalled();
    });

    test("rechaza un campo que no está en la lista", () => {
        try {
            validar({ body: { titulo: "Prueba", rol: "admin" } }, {}, jest.fn());
            throw new Error("debió rechazar");
        } catch (error) {
            expect(error).toBeInstanceOf(DatosInvalidos);
            expect(error.errores.rol).toBe("Campo no permitido.");
        }
    });

    test("rechaza un valor que no es texto", () => {
        try {
            validar({ body: { estado: ["Abierto"] } }, {}, jest.fn());
            throw new Error("debió rechazar");
        } catch (error) {
            expect(error.errores.estado).toBe("Debe ser un texto.");
        }
    });
});
