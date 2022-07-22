module.exports = (sequelize, Sequelize) => {
  const Table = sequelize.define(
    "product",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      product_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      product_category: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      product_desc: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      product_image: {
        type: Sequelize.STRING(2048),
        allowNull: false,
      },
      product_qty: {
        type: Sequelize.INTEGER(50),
        allowNull: false,
      },
    },

    {
      underscored: true,
      createAt: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      tableName: "product",
    }
  );

  return Table;
};
