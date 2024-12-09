module.exports = (app) => {
  let router = require("express").Router();

  const controller = require("../controllers/punto.controller.js");

  router.get("/", controller.listPunto);
  router.get("/:id", controller.getPuntoById);
  router.post("/", controller.createPunto);
  router.put("/:id", controller.updatePunto);
  router.delete("/:id", controller.deletePunto);

  router.post("/carretera/:carreteraId", controller.createPuntos);

  app.use("/punto", router);
};
