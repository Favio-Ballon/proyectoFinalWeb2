module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define("usuario", {
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    admin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  });
  return Usuario;
};
