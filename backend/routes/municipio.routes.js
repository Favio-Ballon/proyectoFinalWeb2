const authMiddleware = require("../middlewares/authMiddleware");
module.exports = (app) => {
  let router = require("express").Router();

  const controller = require("../controllers/municipio.controller.js");

  router.get("/", controller.listMunicipio);
  router.get("/:id", authMiddleware, controller.getMunicipioById);
  router.post("/", authMiddleware,controller.createMunicipio);
  router.put("/:id", authMiddleware,controller.updateMunicipio);
  router.delete("/:id",authMiddleware, controller.deleteMunicipio);

  app.use("/municipio", router);
};
