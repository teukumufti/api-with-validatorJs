module.exports = (sequelize, Sequelize) => {
  const Table = sequelize.define(
    "transaction",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      id_product: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      id_buyer: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      id_seller: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    },
    {
      underscored: true,
      createAt: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      tableName: "transaction",
    }
  );

  return Table;
};
