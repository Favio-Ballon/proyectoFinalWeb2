const db = require("../models");
const { isRequestValid } = require("../utils/request.utils");

exports.listPunto = async (req, res) => {
  try {
    const puntos = await db.puntos.findAll();
    res.status(200).json(puntos);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getPuntoById = async (req, res) => {
  try {
    const id = req.params.id;
    const punto = await db.puntos.findByPk(id);
    if (!punto) {
      res.status(404).json({
        message: "Punto no encontrado",
      });
    } else {
      res.status(200).json(punto);
    }
  } catch {
    sendError500(res, error);
  }
};

exports.createPunto = async (req, res) => {
  try {
    const requiredFields = ["latitud", "longitud", "carreteraId"];
    if (isRequestValid(requiredFields, req.body, res)) {
      const punto = {
        latitud: req.body.latitud,
        longitud: req.body.longitud,
        carreteraId: req.body.carreteraId,
      };
      const newPunto = await db.puntos.create(punto);
      res.status(201).json(newPunto);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updatePunto = async (req, res) => {
  try {
    const requiredFields = ["latitud", "longitud", "carreteraId"];
    if (isRequestValid(requiredFields, req.body, res)) {
      const id = req.params.id;
      const punto = await db.puntos.findByPk(id);
      if (!punto) {
        res.status(404).json({
          message: "Punto no encontrado",
        });
      } else {
        punto.latitud = req.body.latitud;
        punto.longitud = req.body.longitud;
        punto.carreteraId = req.body.carreteraId;
        await punto.save();
        res.status(200).json(punto);
      }
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deletePunto = async (req, res) => {
  try {
    const id = req.params.id;
    const punto = await db.puntos.findByPk(id);
    if (!punto) {
      res.status(404).json({
        message: "Punto no encontrado",
      });
    } else {
      await punto.destroy();
      res.status(204).json();
    }
  } catch (error) {
    sendError500(res, error);
  }
};
