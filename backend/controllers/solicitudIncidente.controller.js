const db = require("../models");
const { isRequestValid } = require("../utils/request.utils");
const { uploadImage } = require("../utils/imagen.utils");
const fs = require("fs");

exports.listSolicitudIncidente = async (req, res) => {
  try {
    const solicitudesIncidentes = await db.solicitudesIncidentes.findAll();
    res.status(200).json(solicitudesIncidentes);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getSolicitudIncidenteById = async (req, res) => {
  try {
    const id = req.params.id;
    const solicitudIncidente = await db.solicitudesIncidentes.findByPk(id);
    if (!solicitudIncidente) {
      res.status(404).json({
        message: "Solicitud de incidente no encontrada",
      });
    } else {
      res.status(200).json(solicitudIncidente);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createSolicitudIncidente = async (req, res) => {
  try {
    const requiredFields = ["detalle"];
    if (!req.files) {
      res.status(400).json({
        msg: "No se ha enviado la imagen",
      });
      return;
    }

    const pathImage = uploadImage(req.files.foto, "solicitudIncidente");

    if (isRequestValid(requiredFields, req.body, res)) {
      const solicitudIncidente = {
        detalle: req.body.detalle,
        foto: pathImage,
      };
      const newSolicitudIncidente = await db.solicitudesIncidentes.create(
        solicitudIncidente
      );
      res.status(201).json(newSolicitudIncidente);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updateSolicitudIncidente = async (req, res) => {
  try {
    const requiredFields = ["detalle"];
    if (isRequestValid(requiredFields, req.body, res)) {
      const id = req.params.id;
      const solicitudIncidente = await db.solicitudesIncidentes.findByPk(id);
      if (!solicitudIncidente) {
        res.status(404).json({
          message: "Solicitud de incidente no encontrada",
        });
      } else {
        if (req.files) {
          const pathImage = uploadImage(req.files.foto, "solicitudIncidente");
          const pathImageOld = solicitudIncidente.foto;
          if (pathImageOld) {
            fs.unlinkSync("public/images/solicitudIncidente/" + pathImageOld);
          }
          solicitudIncidente.foto = pathImage;
        }
        solicitudIncidente.detalle = req.body.detalle;
        await solicitudIncidente.save();
        res.status(200).json(solicitudIncidente);
      }
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deleteSolicitudIncidente = async (req, res) => {
  try {
    const id = req.params.id;
    const solicitudIncidente = await db.solicitudesIncidentes.findByPk(id);
    if (!solicitudIncidente) {
      res.status(404).json({
        message: "Solicitud de incidente no encontrada",
      });
    } else {
      const pathImage = solicitudIncidente.foto;
      if (pathImage) {
        fs.unlinkSync("public/images/solicitudIncidente/" + pathImage);
      }
      await solicitudIncidente.destroy();
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
