module.exports = (sequelize, Sequelize) => {
  const SolicitudIncidente = sequelize.define("solicitudIncidente", {
    detalle: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    foto: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return SolicitudIncidente;
};
