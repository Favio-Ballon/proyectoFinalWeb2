module.exports = (app) => {
    let router = require("express").Router();

    const controller = require("../controllers/solicitudIncidente.controller.js");

    router.get("/", controller.listSolicitudIncidente);
    router.get("/:id", controller.getSolicitudIncidenteById);
    router.post("/", controller.createSolicitudIncidente);
    router.put("/:id", controller.updateSolicitudIncidente);
    router.delete("/:id", controller.deleteSolicitudIncidente);

    app.use("/solicitudIncidente", router);
}