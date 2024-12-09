import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";
import HeaderAdmin from "../components/headerAdmin";
import { useAuth } from "../hooks/useAuth";

function UsuarioList() {
  const token = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: true,
    password: "",
  });

  // Cargar la lista de usuarios al inicio
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:3000/usuario", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await axios.delete(`http://localhost:3000/usuario/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchUsuarios(); // Actualizar lista
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ nombre: user.nombre, email: user.email, rol: user.admin });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:3000/usuario/${editingUser.id}`,
        {
          nombre: formData.nombre,
          email: formData.email,
          admin: formData.rol,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowModal(false);
      fetchUsuarios(); // Actualizar lista
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const handlePasswordChange = async (id) => {
    const newPassword = window.prompt("Ingrese la nueva contraseña:");
    if (newPassword) {
      try {
        await axios.put(
          `http://localhost:3000/usuario/${id}/password`,
          {
            newPassword: newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Contraseña actualizada con éxito.");
      } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
      }
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ nombre: "", email: "" });
    setShowModal(true);
  };

  const handleAddUser = async () => {
    console.log(formData);
    try {
      await axios.post(
        "http://localhost:3000/usuario",
        {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          admin: formData.rol,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowModal(false);
      fetchUsuarios(); // Actualizar lista
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };

  return (
    <div className="container mt-5">
      <HeaderAdmin />
      <h1>Gestión de Usuarios</h1>
      <Button onClick={handleCreate} className="mb-3">
        Crear Usuario
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.admin ? "Administrador" : "Verificador"}</td>
              <td>
                <Button
                  variant="warning"
                  onClick={() => handleEdit(usuario)}
                  className="me-2"
                >
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handlePasswordChange(usuario.id)}
                  className="me-2"
                >
                  Cambiar Contraseña
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(usuario.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para Crear/Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? "Editar Usuario" : "Crear Usuario"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Form.Group>
            {!editingUser && (
              <Form.Group className="mb-3">
                <Form.Label>password</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={formData.rol}
                onChange={(e) =>
                  setFormData({ ...formData, rol: e.target.value })
                }
              >
                <option value="true">Administrador</option>
                <option value="false">Verificador</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={editingUser ? handleSave : handleAddUser}
          >
            {editingUser ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UsuarioList;
