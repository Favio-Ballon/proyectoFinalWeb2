import { useEffect, useState } from "react";
import { Map, Marker } from "@vis.gl/react-google-maps";
import { Table, Button, Modal, Form } from "react-bootstrap";
import HeaderAdmin from "../components/headerAdmin";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";

const Municipios = () => {
  const token = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));
  const [municipios, setMunicipios] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: -16.290154,
    lng: -63.588653,
  }); 
  const [showModal, setShowModal] = useState(false);
  const [currentMunicipio, setCurrentMunicipio] = useState({
    id: 0,
    nombre: "",
    latitud: mapCenter.lat,
    longitud: mapCenter.lng,
    createdAt: "",
    updatedAt: "",
    usuarioId: user.id,
  });
  const [selecionarUbicacion, setSelecionarUbicacion] = useState(false);
  const [editar, setEditar] = useState(false);

  useEffect(() => {
    fetchMunicipios();
  }, []);

  const fetchMunicipios = () => {
    fetch("http://localhost:3000/municipio", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setMunicipios(data))
      .catch((error) => console.error("Error fetching municipios:", error));
  };

  const handleView = (municipio) => {
    setMapCenter({
      lat: parseFloat(municipio.latitud),
      lng: parseFloat(municipio.longitud),
    });
  };

  const handleEdit = (municipio) => {
    setMapCenter({
      lat: parseFloat(municipio.latitud),
      lng: parseFloat(municipio.longitud),
    });
    setCurrentMunicipio({
      id: municipio.id,
      nombre: municipio.nombre,
      latitud: parseFloat(municipio.latitud),
      longitud: parseFloat(municipio.longitud),
      createdAt: municipio.createdAt,
      updatedAt: municipio.updatedAt,
      usuarioId: user.id,
    });
    setEditar(true);
    setSelecionarUbicacion(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este municipio?")) {
      axios
        .delete(`http://localhost:3000/municipio/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          alert("Municipio eliminado correctamente.");
          fetchMunicipios();
        })
        .catch((error) => console.error("Error eliminando municipio:", error));
    }
  };

  const handleSaveEdit = () => {
    const newMunicipio = {
      nombre: currentMunicipio.nombre,
      latitud: parseFloat(currentMunicipio.latitud),  
      longitud: parseFloat(currentMunicipio.longitud),
      usuarioId: user.id,
    }

    console.log("newMunicipio:", newMunicipio);

    fetch(`http://localhost:3000/municipio/${currentMunicipio.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMunicipio),
    })
      .then(() => {
        alert("Municipio actualizado correctamente.");
        setShowModal(false);
        fetchMunicipios();
        setEditar(false);
        setSelecionarUbicacion(false);
      })
      .catch((error) => console.error("Error actualizando municipio:", error));
  };

  const handleAddMunicipio = () => {
    setCurrentMunicipio({
      ...currentMunicipio,
      usuarioId: user.id,
    });
    console.log("currentMunicipio:", currentMunicipio);
    fetch("http://localhost:3000/municipio", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentMunicipio),
    })
      .then(() => {
        alert("Municipio añadido correctamente.");
        setShowModal(false);
        fetchMunicipios();
        selecionarUbicacion(false);
      })
      .catch((error) => console.error("Error añadiendo municipio:", error));
  };

  const handleCenterChanged = (map) => {
    const newCenter = map.detail.center;
    setMapCenter({
      lat: newCenter.lat,
      lng: newCenter.lng,
    });
  };

  return (
    <div className="container mt-4">
      <HeaderAdmin />
      <h1 className="mb-4">Mapa de Municipios</h1>

      {!selecionarUbicacion ? (
        <Button
          className="mb-4"
          variant="success"
          onClick={() => setSelecionarUbicacion(true)}
        >
          Añadir Municipio
        </Button>
      ) : (
        <>
          <div className="mb-2">
            <Button
              className=""
              variant="success"
              onClick={() => {
                setSelecionarUbicacion(false);
                setEditar(false);
                setMunicipios(municipios);
                setCurrentMunicipio({
                  id: 0,
                  nombre: "",
                  latitud: mapCenter.lat,
                  longitud: mapCenter.lng,
                  createdAt: "",
                  updatedAt: "",
                  usuarioId: user.id,
                });
              }}
            >
              cancelar
            </Button>
            <Button
              className="mx-1"
              variant="success"
              onClick={() => setShowModal(true)}
            >
              Guardar ubicacion
            </Button>
          </div>
          <p className="text-muted">
            Mueve el marcador para seleccionar la ubicación del{" "}
            {!editar ? "nuevo" : ""} municipio.
          </p>
        </>
      )}

      {/* Mapa */}
      <div style={{ height: "400px", width: "100%" }}>
        <Map
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          streetViewControl={false}
          maxZoom={9}
          minZoom={6}
          defaultZoom={7}
          onCenterChanged={(map) => handleCenterChanged(map)}
        >
          {municipios.map((municipio) => (
            <div key={municipio.id}>
              {currentMunicipio.id !== municipio.id && (
                <Marker
                  position={{
                    lat: parseFloat(municipio.latitud),
                    lng: parseFloat(municipio.longitud),
                  }}
                />
              )}
            </div>
          ))}

          {selecionarUbicacion && (
            <Marker
              position={mapCenter}
              draggable={true}
              onDragEnd={(e) => {
                const newLat = e.latLng.lat();
                const newLng = e.latLng.lng();
                setMapCenter({ lat: newLat, lng: newLng });
                setCurrentMunicipio({
                  ...currentMunicipio,
                  latitud: newLat,
                  longitud: newLng,
                });
              }}
            />
          )}
        </Map>
      </div>

      {/* Lista de Municipios */}
      <h2 className="mt-4">Lista de Municipios</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Latitud</th>
            <th>Longitud</th>
            {user?.admin && <th>Usuario</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {municipios.map((municipio) => (
            <tr key={municipio.id}>
              <td>{municipio.id}</td>
              <td>{municipio.nombre}</td>
              <td>{municipio.latitud}</td>
              <td>{municipio.longitud}</td>
              {user?.admin && <td>{municipio.usuario?.nombre}</td>}
              <td>
                <Button
                  variant="info"
                  onClick={() => handleView(municipio)}
                  className="me-2"
                >
                  Ver
                </Button>
                <Button
                  variant="warning"
                  onClick={() => handleEdit(municipio)}
                  className="me-2"
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(municipio.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          {editar ? (
            <Modal.Title>Editar Municipio</Modal.Title>
          ) : (
            <Modal.Title>Añadir Municipio</Modal.Title>
          )}
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={currentMunicipio.nombre}
                onChange={(e) =>
                  setCurrentMunicipio({
                    ...currentMunicipio,
                    nombre: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Latitud</Form.Label>
              <Form.Control
                type="number"
                value={currentMunicipio.latitud}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Longitud</Form.Label>
              <Form.Control
                type="number"
                value={currentMunicipio.longitud}
                disabled
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          {editar ? (
            <Button variant="primary" onClick={handleSaveEdit}>
              Guardar
            </Button>
          ) : (
            <Button variant="primary" onClick={handleAddMunicipio}>
              Crear
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Municipios;
