module.exports = (sequelize, Sequelize) => {
  const Incidente = sequelize.define("incidente", {
    tipo: {
      type: Sequelize.ENUM,
      values: [
        "Transitable con desvios y/o horarios de circulación",
        "No transitable por conflictos sociales",
        "Restricción vehicular",
        "No transitable tráfico cerrado",
        "Restricción vehicular, especial",
      ],
      allowNull: false,
    },
    descripcion: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    foto: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Incidente;
};
