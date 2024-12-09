const authMiddleware = require("../middlewares/authMiddleware");

module.exports = (app) => {
  let router = require("express").Router();

  const controller = require("../controllers/usuario.controller.js");

  router.get("/", controller.listUsuario);
  router.get("/:id",authMiddleware, controller.getUsuarioById);
  router.post("/",authMiddleware, controller.createUsuario);
  router.put("/:id", authMiddleware,controller.updateUsuario);
  router.delete("/:id", authMiddleware,controller.deleteUsuario);

  //login
  router.post("/login", controller.login);

  //change password
  router.put("/:id/password",authMiddleware, controller.changePassword);

  app.use("/usuario", router);
};
