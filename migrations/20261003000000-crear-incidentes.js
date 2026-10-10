// crea la tabla de incidentes

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("incidentes", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            titulo: { type: Sequelize.STRING(100), allowNull: false },
            tipo: { type: Sequelize.STRING(30), allowNull: false },
            prioridad: { type: Sequelize.STRING(20), allowNull: false },
            estado: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "Abierto" },
            fecha: { type: Sequelize.DATEONLY, allowNull: false },
            reportadoPor: { type: Sequelize.STRING(100), allowNull: false },
            responsable: {
                type: Sequelize.STRING(100),
                allowNull: false,
                defaultValue: "Equipo de Seguridad",
            },
            descripcion: { type: Sequelize.TEXT, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // índices para los filtros
        await queryInterface.addIndex("incidentes", ["estado"]);
        await queryInterface.addIndex("incidentes", ["prioridad"]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("incidentes");
    },
};
