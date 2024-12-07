module.exports = (sequelize, Sequelize) => {
  const Carretera = sequelize.define("carretera", {
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    estado: {
      type: Sequelize.ENUM("Activa", "Bloqueada"),
      allowNull: false,
    },
    razonBloqueo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Carretera;
};
