const db = require("../models");
const usuario = require("../models/usuario");
const { isRequestValid } = require("../utils/request.utils");

exports.listMunicipio = async (req, res) => {
  try {
    const municipios = await db.municipios.findAll({
      include: ["usuario"],
    });
    res.status(200).json(municipios);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getMunicipioById = async (req, res) => {
  try {
    const id = req.params.id;
    const municipio = await db.municipios.findByPk(id, {
      include: ["carreterasSalida", "carreterasLlegada"],
    });
    if (!municipio) {
      res.status(404).json({
        message: "Municipio no encontrado",
      });
    } else {
      res.status(200).json(municipio);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createMunicipio = async (req, res) => {
  try {
    const requiredFields = ["nombre", "latitud", "longitud"];
    if (isRequestValid(requiredFields, req.body, res)) {
      const municipio = {
        nombre: req.body.nombre,
        latitud: req.body.latitud,
        longitud: req.body.longitud,
      };
      if (req.body.usuarioId) {
        municipio.usuarioId = req.body.usuarioId;
      }
      const newMunicipio = await db.municipios.create(municipio);
      res.status(201).json(newMunicipio);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updateMunicipio = async (req, res) => {
  try {
    const requiredFields = ["nombre", "latitud", "longitud"];
    if (isRequestValid(requiredFields, req.body, res)) {
      const id = req.params.id;
      const municipio = await db.municipios.findByPk(id);
      if (!municipio) {
        res.status(404).json({
          message: "Municipio no encontrado",
        });
      } else {
        municipio.nombre = req.body.nombre;
        municipio.latitud = req.body.latitud;
        municipio.longitud = req.body.longitud;
        if (req.body.usuarioId) {
          municipio.usuarioId = req.body.usuarioId;
        }
        await municipio.save();
        res.status(200).json(municipio);
      }
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deleteMunicipio = async (req, res) => {
  try {
    const id = req.params.id;
    const municipio = await db.municipios.findByPk(id);
    if (!municipio) {
      res.status(404).json({
        message: "Municipio no encontrado",
      });
    } else {
      await municipio.destroy();
      res.status(200).json({
        message: "Municipio eliminado",
      });
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
