module.exports = (app) => {
  let router = require("express").Router();

  const controller = require("../controllers/incidente.controller.js");

  router.get("/", controller.listIncidente);
  router.get("/:id", controller.getIncidenteById);
  router.post("/", controller.createIncidente);
  router.put("/:id", controller.updateIncidente);
  router.delete("/:id", controller.deleteIncidente);

  app.use("/incidente", router);
};
