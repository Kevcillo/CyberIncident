// modelo de usuario, la contraseña se guarda siempre cifrada

const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const ROLES = ["admin", "analista"];
const COSTO_HASH = 10;

function obligatorio(mensaje) {
    return { notNull: { msg: mensaje }, notEmpty: { msg: mensaje } };
}

module.exports = (sequelize) => {

    const Usuario = sequelize.define(
        "Usuario",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            nombre: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    ...obligatorio("El nombre es obligatorio."),
                    len: { args: [3, 100], msg: "El nombre debe tener entre 3 y 100 caracteres." },
                },
            },

            correo: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                validate: {
                    ...obligatorio("El correo es obligatorio."),
                    isEmail: { msg: "El correo no es válido." },
                },
            },

            contrasena: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    ...obligatorio("La contraseña es obligatoria."),
                    len: { args: [8, 100], msg: "La contraseña debe tener al menos 8 caracteres." },
                },
            },

            rol: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "analista",
                validate: {
                    isIn: { args: [ROLES], msg: `El rol debe ser uno de: ${ROLES.join(", ")}.` },
                },
            },
        },
        {
            tableName: "usuarios",

            // la contraseña nunca sale en las consultas normales
            defaultScope: {
                attributes: { exclude: ["contrasena"] },
            },
            scopes: {
                conContrasena: { attributes: { include: ["contrasena"] } },
            },

            // guarda el correo en minúsculas y cifra la contraseña antes de guardarla
            hooks: {
                async beforeSave(usuario) {
                    if (typeof usuario.correo === "string") {
                        usuario.correo = usuario.correo.trim().toLowerCase();
                    }

                    if (usuario.changed("contrasena")) {
                        usuario.contrasena = await bcrypt.hash(usuario.contrasena, COSTO_HASH);
                    }
                },
            },
        }
    );

    // compara una contraseña escrita con el hash guardado
    Usuario.prototype.verificarContrasena = function (contrasena) {
        return bcrypt.compare(contrasena, this.contrasena);
    };

    // por si se pide un usuario con contraseña, tampoco se envía al cliente
    Usuario.prototype.toJSON = function () {
        const datos = { ...this.get() };
        delete datos.contrasena;
        return datos;
    };

    Usuario.ROLES = ROLES;
    Usuario.COSTO_HASH = COSTO_HASH;

    return Usuario;
};
