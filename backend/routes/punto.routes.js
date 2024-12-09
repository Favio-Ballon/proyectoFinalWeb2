const authMiddleware = require("../middlewares/authMiddleware");

module.exports = (app) => {
  let router = require("express").Router();

  const controller = require("../controllers/punto.controller.js");

  router.get("/", controller.listPunto);
  router.get("/:id", authMiddleware, controller.getPuntoById);
  router.post("/", authMiddleware, controller.createPunto);
  router.put("/:id", authMiddleware, controller.updatePunto);
  router.delete("/:id", authMiddleware, controller.deletePunto);

  router.post(
    "/carretera/:carreteraId",
    authMiddleware,
    controller.createPuntos
  );

  app.use("/punto", router);
};
