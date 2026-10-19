// regla de negocio: cada rol solo puede hacer lo que le corresponde

const permitirRoles = require("../../middlewares/roles");
const { SinPermiso } = require("../../errors/errores");

// simula una petición de un usuario con el rol indicado
function peticionDe(rol) {
    return { usuario: rol ? { id: 1, rol } : undefined };
}

describe("permisos por rol", () => {

    test("el administrador puede eliminar", () => {
        const siguiente = jest.fn();

        permitirRoles("admin")(peticionDe("admin"), {}, siguiente);

        expect(siguiente).toHaveBeenCalledTimes(1);
    });

    test("el analista no puede eliminar", () => {
        const siguiente = jest.fn();

        expect(() => permitirRoles("admin")(peticionDe("analista"), {}, siguiente)).toThrow(SinPermiso);
        expect(siguiente).not.toHaveBeenCalled();
    });

    test("el rechazo responde 403 e indica el rol necesario", () => {
        // obliga a que el error ocurra, si no la prueba falla
        expect.assertions(2);

        try {
            permitirRoles("admin")(peticionDe("analista"), {}, jest.fn());
        } catch (error) {
            expect(error.estado).toBe(403);
            expect(error.message).toMatch(/Se requiere: admin/);
        }
    });

    test("ambos roles pueden consultar, crear y editar", () => {
        const regla = permitirRoles("admin", "analista");
        const siguiente = jest.fn();

        regla(peticionDe("admin"), {}, siguiente);
        regla(peticionDe("analista"), {}, siguiente);

        expect(siguiente).toHaveBeenCalledTimes(2);
    });

    test("sin usuario conectado se rechaza", () => {
        expect(() => permitirRoles("admin", "analista")(peticionDe(null), {}, jest.fn())).toThrow(SinPermiso);
    });

    test("un rol desconocido se rechaza", () => {
        expect(() => permitirRoles("admin", "analista")(peticionDe("invitado"), {}, jest.fn())).toThrow(SinPermiso);
    });
});
