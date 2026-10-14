// usuarios de prueba, uno por rol

const bcrypt = require("bcryptjs");

const usuariosIniciales = [
    {
        nombre: "Administrador",
        correo: "admin@cyberincident.com",
        contrasena: "Admin123!",
        rol: "admin",
    },
    {
        nombre: "Analista de Seguridad",
        correo: "analista@cyberincident.com",
        contrasena: "Analista123!",
        rol: "analista",
    },
];

module.exports = {
    usuariosIniciales,

    async up(queryInterface) {
        const ahora = new Date();

        // la inserción directa no pasa por el modelo, por eso se cifra aquí
        const filas = await Promise.all(
            usuariosIniciales.map(async (usuario) => ({
                ...usuario,
                contrasena: await bcrypt.hash(usuario.contrasena, 10),
                createdAt: ahora,
                updatedAt: ahora,
            }))
        );

        await queryInterface.bulkInsert("usuarios", filas);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("usuarios", null, {});
    },
};
