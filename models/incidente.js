// modelo de incidente con sus reglas de validación

const { DataTypes } = require("sequelize");

const TIPOS = ["Phishing", "Malware", "Intrusión", "Fuga de información", "Otro"];
const PRIORIDADES = ["Baja", "Media", "Alta", "Crítica"];
const ESTADOS = ["Abierto", "En investigación", "Cerrado"];

// campo obligatorio con su mensaje
function obligatorio(mensaje) {
    return { notNull: { msg: mensaje }, notEmpty: { msg: mensaje } };
}

module.exports = (sequelize) => {

    const Incidente = sequelize.define(
        "Incidente",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            // código visible con formato INC-001, no se guarda
            codigo: {
                type: DataTypes.VIRTUAL,
                get() {
                    return `INC-${String(this.getDataValue("id")).padStart(3, "0")}`;
                },
            },

            titulo: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    ...obligatorio("El título es obligatorio."),
                    len: { args: [5, 100], msg: "El título debe tener entre 5 y 100 caracteres." },
                },
            },

            tipo: {
                type: DataTypes.STRING(30),
                allowNull: false,
                validate: {
                    ...obligatorio("El tipo es obligatorio."),
                    isIn: { args: [TIPOS], msg: `El tipo debe ser uno de: ${TIPOS.join(", ")}.` },
                },
            },

            prioridad: {
                type: DataTypes.STRING(20),
                allowNull: false,
                validate: {
                    ...obligatorio("La prioridad es obligatoria."),
                    isIn: { args: [PRIORIDADES], msg: `La prioridad debe ser una de: ${PRIORIDADES.join(", ")}.` },
                },
            },

            estado: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "Abierto",
                validate: {
                    ...obligatorio("El estado es obligatorio."),
                    isIn: { args: [ESTADOS], msg: `El estado debe ser uno de: ${ESTADOS.join(", ")}.` },
                },
            },

            fecha: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                validate: {
                    ...obligatorio("La fecha es obligatoria."),
                    is: { args: /^\d{4}-\d{2}-\d{2}$/, msg: "La fecha debe tener formato AAAA-MM-DD." },
                    isDate: { args: true, msg: "La fecha no es válida." },
                },
            },

            reportadoPor: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    ...obligatorio("El correo del reportante es obligatorio."),
                    isEmail: { msg: "El correo del reportante no es válido." },
                },
            },

            responsable: {
                type: DataTypes.STRING(100),
                allowNull: false,
                defaultValue: "Equipo de Seguridad",
                validate: {
                    ...obligatorio("El responsable es obligatorio."),
                    len: { args: [3, 100], msg: "El responsable debe tener entre 3 y 100 caracteres." },
                },
            },

            descripcion: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    ...obligatorio("La descripción es obligatoria."),
                    len: { args: [20, 500], msg: "La descripción debe tener entre 20 y 500 caracteres." },
                },
            },
        },
        {
            tableName: "incidentes",
        }
    );

    Incidente.TIPOS = TIPOS;
    Incidente.PRIORIDADES = PRIORIDADES;
    Incidente.ESTADOS = ESTADOS;

    return Incidente;
};
