// crea la tabla de usuarios

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("usuarios", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            nombre: { type: Sequelize.STRING(100), allowNull: false },
            correo: { type: Sequelize.STRING(100), allowNull: false, unique: true },
            contrasena: { type: Sequelize.STRING(100), allowNull: false },
            rol: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "analista" },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("usuarios");
    },
};
