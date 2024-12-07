const db = require("../models");
const { isRequestValid } = require("../utils/request.utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.listUsuario = async (req, res) => {
  try {
    const usuarios = await db.usuarios.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getUsuarioById = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await db.usuarios.findByPk(id);
    if (!usuario) {
      res.status(404).json({
        message: "Usuario no encontrado",
      });
    } else {
      res.status(200).json(usuario);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createUsuario = async (req, res) => {
  try {
    const requiredFields = ["nombre", "userName", "password", "admin"];

    if (isRequestValid(requiredFields, req.body, res)) {
      //verify username is unique
      const usuarioTemp = await db.usuarios.findOne({
        where: {
          userName: req.body.userName,
        },
      });

      if (usuarioTemp) {
        res.status(400).json({
          message: "Usuario ya existe",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const usuario = {
        nombre: req.body.nombre,
        userName: req.body.userName,
        password: hashedPassword,
        admin: req.body.admin,
      };
      const newUsuario = await db.usuarios.create(usuario);
      res.status(201).json(newUsuario);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

//update usuario but not password
exports.updateUsuario = async (req, res) => {
  try {
    const requiredFields = ["nombre", "userName", "admin"];
    if (isRequestValid(requiredFields, req.body, res)) {
      const id = req.params.id;
      const usuario = await db.usuarios.findByPk(id);
      if (!usuario) {
        res.status(404).json({
          message: "Usuario no encontrado",
        });
      } else {
        usuario.nombre = req.body.nombre;
        usuario.userName = req.body.userName;
        usuario.admin = req.body.admin;
        await usuario.save();
        res.status(200).json(usuario);
      }
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await db.usuarios.findByPk(id);
    if (!usuario) {
      res.status(404).json({
        message: "Usuario no encontrado",
      });
    } else {
      await usuario.destroy();
      res.status(204).json();
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.login = async (req, res) => {
  const requiredFields = ["userName", "password"];
  try {
    if (!isRequestValid(requiredFields, req.body, res)) {
      return;
    }
    const usuario = await db.usuarios.findOne({
      where: {
        userName: req.body.userName,
      },
    });

    if (!usuario) {
      res.status(401).json({
        message: "Usuario no encontrado",
      });
      return;
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      usuario.password
    );

    if (!validPassword) {
      res.status(401).json({
        message: "Contraseña incorrecta",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        admin: usuario.admin,
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      token: token,
    });
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getUsuarioByToken = async (req, res) => {
  try {
    const usuario = await db.usuarios.findByPk(req.userId);
    if (!usuario) {
      res.status(404).json({
        message: "Usuario no encontrado",
      });
    } else {
      res.status(200).json(usuario);
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
