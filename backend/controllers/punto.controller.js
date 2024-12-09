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

exports.createPuntos = async (req, res) => {
  try {
    console.log(req.body);
    //compare puntos from body with puntos from db carretera
    const carreteraId = req.params.carreteraId;
    if (!req.body.puntos) {
      //eliminate all puntos from carretera
      const id = carreteraId;
      const puntos = await db.puntos.findAll({
        where: { carreteraId: id },
      });
      puntos.forEach(async (punto) => {
        await punto.destroy();
      });
      res.status(204).json();
    } else {
      //make sure there are no puntos with the same latitud and longitud
      const puntos = req.body.puntos;
      const newPuntos = [];
      //si un punto de la db no esta en los puntos del body, eliminarlo
      const id = carreteraId;
      const puntosDB = await db.puntos.findAll({
        where: { carreteraId: id },
      });
      puntosDB.forEach(async (puntoDB) => {
        const punto = puntos.find(
          (punto) =>
            punto.latitud === puntoDB.latitud &&
            punto.longitud === puntoDB.longitud
        );
        if (!punto) {
          await puntoDB.destroy();
        }
      });
      for (let i = 0; i < puntos.length; i++) {
        const punto = puntos[i];
        const puntoDB = await db.puntos.findOne({
          where: {
            latitud: punto.latitud,
            longitud: punto.longitud,
            carreteraId: carreteraId,
          },
        });
        if (!puntoDB) {
          const newPunto = await db.puntos.create({
            latitud: punto.latitud,
            longitud: punto.longitud,
            carreteraId: carreteraId,
          });
          newPuntos.push(newPunto);
        }
      }
      res.status(201).json(newPuntos);
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
