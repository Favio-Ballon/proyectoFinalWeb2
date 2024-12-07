module.exports = (app) => {
    require("./municipio.routes")(app);
    require("./usuario.routes")(app);
    require("./carretera.routes")(app);
    require("./punto.routes")(app);
    require("./solicitudIncidente.routes")(app);
    require("./incidente.routes")(app);
};
