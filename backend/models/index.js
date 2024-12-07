const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: "mysql",
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.puntos = require("./punto.js")(sequelize, Sequelize);
db.carreteras = require("./carretera.js")(sequelize, Sequelize);
db.solicitudesIncidentes = require("./solicitudIncidente.js")(
  sequelize,
  Sequelize
);
db.incidentes = require("./incidente.js")(sequelize, Sequelize);
db.usuarios = require("./usuario.js")(sequelize, Sequelize);
db.municipios = require("./municipio.js")(sequelize, Sequelize);

//carretera esta compuesta por multiples puntos
db.carreteras.hasMany(db.puntos, {
  as: "puntos",
  foreignKey: "carreteraId",
});
db.puntos.belongsTo(db.carreteras, {
  foreignKey: "carreteraId",
  as: "carretera",
});

//carretera tiene municipio de llegada y de salida
db.carreteras.belongsTo(db.municipios, {
  foreignKey: "municipioSalidaId",
  as: "municipioSalida",
});
db.carreteras.belongsTo(db.municipios, {
  foreignKey: "municipioLlegadaId",
  as: "municipioLlegada",
});
db.municipios.hasMany(db.carreteras, {
  foreignKey: "municipioSalidaId",
  as: "carreterasSalida",
});
db.municipios.hasMany(db.carreteras, {
  foreignKey: "municipioLlegadaId",
  as: "carreterasLlegada",
});

//incidente tiene un punto
db.incidentes.belongsTo(db.puntos, {
  foreignKey: "puntoId",
  as: "punto",
});
db.puntos.hasOne(db.incidentes, {
  foreignKey: "puntoId",
  as: "incidente",
});

//carretera, municipio, incidente tienen ultimo usuario que modifico/creo
db.carreteras.belongsTo(db.usuarios, {
  foreignKey: "usuarioId",
  as: "usuario",
});
db.municipios.belongsTo(db.usuarios, {
  foreignKey: "usuarioId",
  as: "usuario",
});
db.incidentes.belongsTo(db.usuarios, {
  foreignKey: "usuarioId",
  as: "usuario",
});

module.exports = db;
