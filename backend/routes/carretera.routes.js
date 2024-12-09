const authMiddleware = require("../middlewares/authMiddleware");

module.exports = (app) => {
    let router = require("express").Router();

    const controller = require("../controllers/carretera.controller.js");

    router.get("/", controller.listCarretera);
    router.get("/:id",authMiddleware, controller.getCarreteraById);
    router.post("/", authMiddleware,controller.createCarretera);
    router.put("/:id", authMiddleware, controller.updateCarretera);
    router.delete("/:id",authMiddleware, controller.deleteCarretera);

    app.use("/carretera", router);
}

