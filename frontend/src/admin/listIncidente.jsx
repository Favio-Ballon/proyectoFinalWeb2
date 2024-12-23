import { useEffect, useState } from "react";
import { Map, Marker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import axios from "axios";
import { Button, Form, Image, Modal, Table } from "react-bootstrap";
import HeaderAdmin from "../components/headerAdmin";
import { useAuth } from "../hooks/useAuth";

export default function Incidentes() {
  const token = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));
  const map = useMap();
  const maps = useMapsLibrary("maps");
  const [mapCenter, setMapCenter] = useState({
    lat: -16.290154,
    lng: -63.588653,
  });
  const [incidentes, setIncidentes] = useState([]);
  const [carreteras, setCarreteras] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [polylines, setPolylines] = useState([]);
  const [circles, setCircles] = useState([]); 
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isSelectingPoint, setIsSelectingPoint] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newIncidente, setNewIncidente] = useState({
    incidenteId: 0,
    tipo: "",
    descripcion: "",
    foto: null,
    puntoId: "",
  });
  const [filterByLlegada, setFilterByLlegada] = useState(false);
  const [filterMunicipio, setFilterMunicipio] = useState("");
  const [carreteraFijo, setCarreteraFijo] = useState([]);
  const tipos = [
    "Transitable con desvios y/o horarios de circulación",
    "No transitable por conflictos sociales",
    "Restricción vehicular",
    "No transitable tráfico cerrado",
    "Restricción vehicular, especial",
  ];
  const [file, setFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [solicitudIncidente, setSolicitudIncidente] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log("File: ", e.target.files[0]);
  };

  useEffect(() => {
    if (!maps) return;
    fetchIncidentes();
    fetchCarreteras();
    fetchMunicipios();
    fetchSolicitudIncidente();
  }, [maps]);

  useEffect(() => {
    if (carreteras.length > 0) {
      addPolylineCircle();
    } else {
      polylines.forEach((polyline) => polyline.setMap(null));
      circles.forEach((circle) => circle.setMap(null));
    }
  }, [maps, carreteras]);

  const fetchSolicitudIncidente = () => {
    axios
      .get("http://localhost:3000/solicitudIncidente", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setSolicitudIncidente(response.data);
      })
      .catch((error) =>
        console.error("Error fetching solicitud incidente:", error)
      );
  };

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

  const fetchCarreteras = () => {
    axios
      .get("http://localhost:3000/carretera", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setCarreteras(response.data);
        setCarreteraFijo(response.data);
        console.log("Carreteras: ", response.data);
      })
      .catch((error) => console.error("Error fetching carreteras:", error));
  };

  const fetchIncidentes = () => {
    axios
      .get("http://localhost:3000/incidente", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setIncidentes(response.data);
      })
      .catch((error) => console.error("Error fetching incidentes:", error));
  };

  const addPolylineCircle = () => {
    const polylineArray = carreteras.map((carretera) => [
      {
        lat: parseFloat(carretera.municipioSalida.latitud),
        lng: parseFloat(carretera.municipioSalida.longitud),
        puntoId: carretera.municipioSalida.id,
        incidente: null,
      },
      ...carretera.puntos.map((punto) => ({
        lat: parseFloat(punto.latitud),
        lng: parseFloat(punto.longitud),
        puntoId: punto.id,
        incidente: punto.incidente ? punto.incidente : null,
      })),
      {
        lat: parseFloat(carretera.municipioLlegada.latitud),
        lng: parseFloat(carretera.municipioLlegada.longitud),
        puntoId: carretera.municipioLlegada.id,
        incidente: null,
      },
    ]);

    
    polylines.forEach((polyline) => polyline.setMap(null));
    circles.forEach((circle) => circle.setMap(null));

    const newPolylines = [];
    const newCircles = [];

    polylineArray.forEach((poly) => {
      const polyline = new maps.Polyline({
        path: poly,
        geodesic: true,
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        zIndex: 1,
      });
      polyline.setMap(map);
      newPolylines.push(polyline);

      poly.forEach((punto) => {
        if (punto.incidente) {
          const circle = new maps.Circle({
            key: punto.puntoId,
            strokeColor: "#ff0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#ff0000",
            fillOpacity: 1,
            center: punto,
            radius: 1500,
            zIndex: 3,
          });
          circle.setMap(map);
          newCircles.push(circle);
        } else {
          const circle = new maps.Circle({
            key: punto.puntoId,
            strokeColor: "#00ff00",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#00ff00",
            fillOpacity: 1,
            center: punto,
            radius: 1500,
            zIndex: 2,
          });

          circle.setMap(map);
          newCircles.push(circle);
        }
      });
    });

    
    setPolylines(newPolylines);
    setCircles(newCircles);
  };

  useEffect(() => {
    circles.forEach((circle) => {
      circle.addListener("click", () => {
        if (!isSelectingPoint) return;
        setSelectedPoint(circle.key);
        console.log("Selected point:", circle.key);
        setShowModal(true);
      });
    });
  }, [isSelectingPoint, circles]);

  const handleSaveIncidente = () => {
    if (!selectedPoint) {
      alert("Seleccione un punto en el mapa.");
      return;
    }

    const incidenteData = {
      tipo: newIncidente.tipo,
      descripcion: newIncidente.descripcion,
      puntoId: selectedPoint,
    };

    
    const formData = new FormData();
    formData.append("tipo", incidenteData.tipo);
    formData.append("descripcion", incidenteData.descripcion);
    formData.append("puntoId", incidenteData.puntoId);
    formData.append("usuarioId", user.id);
    if (file) {
      formData.append("foto", file);
    }

    if (isEditing) {
      axios
        .put(
          `http://localhost:3000/incidente/${newIncidente.incidenteId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          alert("Incidente editado correctamente.");
          setShowModal(false);
          setNewIncidente({
            tipo: "",
            descripcion: "",
            foto: "",
            puntoId: "",
          });
          setSelectedPoint(null);
          fetchIncidentes();
          setIsEditing(false);
        });
    } else {
      axios
        .post("http://localhost:3000/incidente", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          alert("Incidente creado correctamente.");
          setShowModal(false);
          setNewIncidente({
            tipo: "",
            descripcion: "",
            foto: "",
            puntoId: "",
          });
          setSelectedPoint(null);
          fetchIncidentes();
        })
        .catch((error) => console.error("Error creando incidente:", error));
    }
  };

  const handleCenterChanged = (map) => {
    const newCenter = map.detail.center;
    setMapCenter({
      lat: newCenter.lat,
      lng: newCenter.lng,
    });
  };

  const handleView = (id) => {
    const circle = circles.find((circle) => circle.key === id);
    if (!circle) {
      console.error(`Circle with id ${id} not found`);
      return;
    }
    map.panTo(circle.center);
    map.setZoom(10);
    
    const growInterval = setInterval(() => {
      circle.setRadius(circle.getRadius() + 100);
    }, 100);
    setTimeout(() => {
      clearInterval(growInterval);
      const shrinkInterval = setInterval(() => {
        circle.setRadius(circle.getRadius() - 100);
      }, 100);
      setTimeout(() => {
        clearInterval(shrinkInterval);
      }, 1000);
    }, 1000);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este incidente?")) {
      axios
        .delete(`http://localhost:3000/incidente/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(() => {
          alert("Incidente eliminado correctamente.");
          fetchIncidentes();
        })
        .catch((error) => console.error("Error eliminando incidente:", error));
    }
  };

  const handleEdit = (incidente) => {
    setIsEditing(true);
    setNewIncidente({
      tipo: incidente.tipo,
      descripcion: incidente.descripcion,
      foto: incidente.foto,
      puntoId: incidente.puntoId,
      incidenteId: incidente.id,
    });
    setSelectedPoint(incidente.puntoId);
    setIsSelectingPoint(true);
  };

  useEffect(() => {
    if (filterByLlegada) {
      if (filterMunicipio !== "") {
        setCarreteras(
          carreteraFijo.filter(
            (carretera) =>
              carretera.municipioLlegadaId === parseInt(filterMunicipio)
          ) ?? []
        );
        console.log("carreteras: ", carreteras);
      } else {
        setCarreteras(carreteraFijo);
      }
    } else {
      if (filterMunicipio !== "") {
        setCarreteras(
          carreteraFijo.filter(
            (carretera) =>
              carretera.municipioSalidaId === parseInt(filterMunicipio)
          ) ?? []
        );
      } else {
        setCarreteras(carreteraFijo);
      }
    }
  }, [filterMunicipio, filterByLlegada]);

  return (
    <>
      <HeaderAdmin />
      <div className="container mt-4">
        <h1 className="mb-4">Gestión de Incidentes</h1>
        {!isSelectingPoint ? (
          <>
            <Button
              className="mb-4"
              variant="success"
              onClick={() => {
                setIsSelectingPoint(true);
                addPolylineCircle();
              }}
            >
              Añadir incidente
            </Button>
          </>
        ) : (
          <>
            <Button
              className="mb-4"
              variant="danger"
              onClick={() => {
                setIsSelectingPoint(false);
                setCarreteras(carreteraFijo);
                setSelectedPoint(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="mb-4"
              variant="success"
              onClick={() => {
                if (!selectedPoint) {
                  alert("Seleccione un punto en el mapa.");
                  return;
                } else {
                  setIsSelectingPoint(false);
                  setShowModal(true);
                }
              }}
            >
              Guardar Puntos
            </Button>
          </>
        )}
        <div style={{ height: "400px", width: "100%" }}>
          <Map
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            streetViewControl={false}
            maxZoom={10}
            minZoom={6}
            defaultZoom={8}
            onCenterChanged={(map) => handleCenterChanged(map)}
          >
            {municipios.map((municipio) => (
              <div key={municipio.id}>
                <Marker
                  position={{
                    lat: parseFloat(municipio.latitud),
                    lng: parseFloat(municipio.longitud),
                  }}
                />
              </div>
            ))}
          </Map>
        </div>

        <h2 className="mt-4">Lista de Incidentes</h2>
        <div className="mb-2" style={{ display: "flex", gap: "1rem" }}>
          <Form.Select
            style={{ flex: "1" }}
            value={filterByLlegada}
            onChange={(e) => setFilterByLlegada(e.target.value)}
          >
            <option value={true}>Llegada</option>
            <option value={false}>Salida</option>
          </Form.Select>
          <Form.Select
            style={{ flex: "1" }}
            value={filterMunicipio}
            onChange={(e) => setFilterMunicipio(e.target.value)}
          >
            <option value="">Todos</option>
            {municipios.map((municipio) => (
              <option key={municipio.id} value={municipio.id}>
                {municipio.nombre}
              </option>
            ))}
          </Form.Select>
        </div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Foto</th>
              {user?.admin && <th>Usuario</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidentes.map((incidente) => (
              <tr key={incidente.id}>
                <td>{incidente.id}</td>
                <td>{incidente.tipo || "No especificado"}</td>
                <td>{incidente.descripcion}</td>
                <td>
                  <Image
                    src={`http://localhost:3000/images/incidente/${incidente.foto}`}
                    width="100"
                    height="100"
                  />
                </td>
                {user?.admin && <td>{incidente.usuario?.nombre}</td> }
                <td>
                  <Button
                    variant="info"
                    onClick={() => handleView(incidente.puntoId)}
                  >
                    Ver
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => handleEdit(incidente)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(incidente.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        <h2 className="mt-4">Lista de Solicitudes de Incidentes</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Detalle</th>
              <th>Foto</th>
            </tr>
          </thead>
          <tbody>
            {solicitudIncidente.map((solicitud) => (
              <tr key={solicitud.id}>
                <td>{solicitud.detalle}</td>
                <td>
                  <Image
                    src={`http://localhost:3000/images/solicitudIncidente/${solicitud.foto}`}
                    width="100"
                    height="100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Incidente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                value={newIncidente.tipo}
                onChange={(e) =>
                  setNewIncidente({ ...newIncidente, tipo: e.target.value })
                }
              >
                {tipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newIncidente.descripcion}
                onChange={(e) =>
                  setNewIncidente({
                    ...newIncidente,
                    descripcion: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Foto</Form.Label>
              {isEditing ? (
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              ) : (
                (
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                )
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveIncidente}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
