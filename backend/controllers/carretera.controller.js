const db = require("../models");
const { isRequestValid } = require("../utils/request.utils");

exports.listCarretera = async (req, res) => {
  try {
    const carreteras = await db.carreteras.findAll({
      include: [
        "municipioSalida",
        "municipioLlegada",
        "usuario",
        { association: "puntos", include: ["incidente"] },
      ],
    });
    res.status(200).json(carreteras);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getCarreteraById = async (req, res) => {
  try {
    const id = req.params.id;
    const carretera = await db.carreteras.findByPk(id, {
      include: ["municipioSalida", "municipioLlegada", "puntos"],
    });
    if (!carretera) {
      res.status(404).json({
        message: "Carretera no encontrada",
      });
    } else {
      res.status(200).json(carretera);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createCarretera = async (req, res) => {
  try {
    const requiredFields = [
      "nombre",
      "estado",
      "municipioLlegadaId",
      "municipioSalidaId",
    ];
    if (isRequestValid(requiredFields, req.body, res)) {
      const carretera = {
        nombre: req.body.nombre,
        estado: req.body.estado,
        razonBloqueo: req.body.razonBloqueo ?? "",
        municipioLlegadaId: req.body.municipioLlegadaId,
        municipioSalidaId: req.body.municipioSalidaId,
      };
      if (req.body.usuarioId) {
        carretera.usuarioId = req.body.usuarioId;
      }
      const newCarretera = await db.carreteras.create(carretera);
      res.status(201).json(newCarretera);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updateCarretera = async (req, res) => {
  try {
    const requiredFields = [
      "nombre",
      "estado",
      "municipioLlegadaId",
      "municipioSalidaId",
    ];
    if (isRequestValid(requiredFields, req.body, res)) {
      const id = req.params.id;
      const carretera = await db.carreteras.findByPk(id);
      if (!carretera) {
        res.status(404).json({
          message: "Carretera no encontrada",
        });
      } else {
        carretera.nombre = req.body.nombre;
        carretera.estado = req.body.estado;
        carretera.razonBloqueo = req.body.razonBloqueo ?? "";
        carretera.municipioLlegadaId = req.body.municipioLlegadaId;
        carretera.municipioSalidaId = req.body.municipioSalidaId;
        if (req.body.usuarioId) {
          carretera.usuarioId = req.body.usuarioId;
        }
        await carretera.save();
        res.status(200).json(carretera);
      }
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deleteCarretera = async (req, res) => {
  try {
    const id = req.params.id;
    const carretera = await db.carreteras.findByPk(id);
    if (!carretera) {
      res.status(404).json({
        message: "Carretera no encontrada",
      });
    } else {
      await carretera.destroy();
      res.status(204).json();
    }
  } catch (error) {
    sendError500(res, error);
  }
};

const sendError500 = (res, error) => {
  console.log(error); // Log the error
  res.status(500).json({
    message: "Internal Server Error",
    error: error.message,
  });
};
