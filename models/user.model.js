module.exports = (sequelize, Sequelize) => {
  const Table = sequelize.define(
    "user",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },

    {
      underscored: true,
      createAt: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      tableName: "user",
    }
  );

  return Table;
};
