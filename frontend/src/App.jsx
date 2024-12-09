import { useEffect, useState } from "react";
import { Map, useMap, useMapsLibrary, Marker } from "@vis.gl/react-google-maps";
import axios from "axios";
import { Button, Form, Image, Modal, Table } from "react-bootstrap";
import HeaderPublic from "./components/headerUser";

export default function Carreteras() {
  const map = useMap();
  const maps = useMapsLibrary("maps");
  const [mapCenter, setMapCenter] = useState({
    lat: -16.290154,
    lng: -63.588653,
  });
  const [carreteras, setCarreteras] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [polylines, setPolylines] = useState([]);
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCarretera, setCurrentCarretera] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterByTipo, setFilterByTipo] = useState("");
  const [filterMunicipio, setFilterMunicipio] = useState("");
  const [showModalIncidente, setShowModalIncidente] = useState(false);
  const [incidente, setIncidente] = useState({
    descripcion: "",
    foto: "",
  });
  const [carreteraFijo, setCarreteraFijo] = useState([]);
  const [newIncidenteDescripcion, setNewIncidenteDescripcion] = useState("");
  const [newIncidenteFoto, setNewIncidenteFoto] = useState(null);

  useEffect(() => {
    if (!maps) return;
    fetchCarreteras();
    fetchMunicipios();
  }, [maps]);

  useEffect(() => {
    if (carreteras.length > 0) {
      addPolylineCircle();
      setLoading(false);
    }
  }, [carreteras]);

  const fetchCarreteras = () => {
    axios
      .get("http://localhost:3000/carretera")
      .then((response) => {
        setCarreteras(response.data);
        setCarreteraFijo(response.data);
      })
      .catch((error) => console.error("Error fetching carreteras:", error));
  };

  const fetchMunicipios = () => {
    axios
      .get("http://localhost:3000/municipio")
      .then((response) => {
        setMunicipios(response.data);
      })
      .catch((error) => console.error("Error fetching municipios:", error));
  };

  const addPolylineCircle = () => {
    polylines.forEach((polyline) => polyline.setMap(null));
    circles.forEach((circle) => circle.setMap(null));

    const polylineArray = carreteras.map((carretera) => [
      {
        lat: parseFloat(carretera.municipioSalida.latitud),
        lng: parseFloat(carretera.municipioSalida.longitud),
        incidente: null,
      },
      ...carretera.puntos.map((punto) => ({
        lat: parseFloat(punto.latitud),
        lng: parseFloat(punto.longitud),
        incidente: punto.incidente ? punto.incidente : null,
      })),
      {
        lat: parseFloat(carretera.municipioLlegada.latitud),
        lng: parseFloat(carretera.municipioLlegada.longitud),
        incidente: null,
      },
    ]);

    console.log(polylineArray);

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

  const handleView = (carretera) => {
    if (currentCarretera === carretera) {
      setCurrentCarretera(null);
      polylines.forEach((polyline) => polyline.setMap(null));
      circles.forEach((circle) => circle.setMap(null));
      addPolylineCircle();
      return;
    }
    setCurrentCarretera(carretera);
    const polylineArray = [
      {
        lat: carretera.municipioSalida.latitud,
        lng: carretera.municipioSalida.longitud,
      },
      ...carretera.puntos.map((punto) => ({
        lat: punto.latitud,
        lng: punto.longitud,
      })),
      {
        lat: carretera.municipioLlegada.latitud,
        lng: carretera.municipioLlegada.longitud,
      },
    ];

    polylines.forEach((polyline) => polyline.setMap(null));
    circles.forEach((circle) => circle.setMap(null));

    const polyline = new maps.Polyline({
      path: polylineArray,
      geodesic: true,
      strokeColor: "#00ff00",
      strokeOpacity: 1.0,
      strokeWeight: 5,
      zIndex: 3,
    });
    polyline.setMap(map);
    setPolylines([polyline]);
    map.setCenter(polylineArray[Math.floor(polylineArray.length / 2)]);
    map.setZoom(9);
  };

  const handleReportIncidente = () => {
    setShowModal(true);
  };

  const handleSaveIncident = () => {
    const formData = new FormData();
    formData.append("detalle", newIncidenteDescripcion);
    formData.append("foto", newIncidenteFoto);

    axios
      .post(`http://localhost:3000/solicitudIncidente`, formData)
      .then(() => {
        alert("Incidente reportado correctamente.");
        setShowModal(false);
      })
      .catch((error) => console.error("Error reportando incidente:", error));
    setShowModal(false);
  };

  const handleFilterChange = () => {};

  const handleCenterChanged = (map) => {
    const newCenter = map.detail.center;
    setMapCenter({
      lat: newCenter.lat,
      lng: newCenter.lng,
    });
  };

  const showMotivoBloqueo = (carretera) => {
    
    const incidente = carretera.puntos.find((punto) => punto.incidente);
    if (incidente) {
      
      setIncidente({
        descripcion: incidente.incidente.descripcion,
        foto: incidente.incidente.foto,
      });
      setShowModalIncidente(true);
    }
  };

  const searchMunicipio = (id) => {
    setFilterMunicipio(id);
    const municipio = municipios.find(
      (municipio) => municipio.id === parseInt(id)
    );
    if (municipio) {
      map.setCenter({
        lat: parseFloat(municipio.latitud),
        lng: parseFloat(municipio.longitud),
      });
      map.setZoom(11);
    }
  };

  const filtrarPorTipo = (tipo) => {
    setFilterByTipo(tipo);

    if (tipo === "") {
      setCarreteras(carreteraFijo);
      return;
    }

    const filteredCarreteras = carreteraFijo.filter((carretera) =>
      carretera.puntos.some(
        (punto) => punto.incidente && punto.incidente.tipo === tipo
      )
    );
    setCarreteras(filteredCarreteras ? filteredCarreteras : []);
    if (filteredCarreteras.length < 1) {
      polylines.forEach((polyline) => polyline.setMap(null));
      circles.forEach((circle) => circle.setMap(null));
    }
    console.log(carreteras);
  };

  const handleFileChange = (e) => {
    setNewIncidenteFoto(e.target.files[0]);
    console.log("File: ", e.target.files[0]);
  };

  return (
    <>
      <HeaderPublic />
      <div className="container mt-4">
        <h1 className="mb-4">Mapa de Carreteras</h1>
        <div className="mb-4">
          <Button variant="primary" onClick={handleReportIncidente}>
            Reportar Incidente
          </Button>
        </div>

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
              <Marker
                key={municipio.id}
                position={{
                  lat: parseFloat(municipio.latitud),
                  lng: parseFloat(municipio.longitud),
                }}
              />
            ))}
          </Map>
        </div>

        <h2 className="mt-4">Lista de Carreteras</h2>

        <div className="mb-2" style={{ display: "flex", gap: "1rem" }}>
          <Form.Select
            style={{ flex: "1" }}
            value={filterByTipo}
            onChange={(e) => filtrarPorTipo(e.target.value)}
          >
            <option value="">Filtrar por tipo</option>
            <option value="Transitable con desvíos">
              Transitable con desvíos
            </option>
            <option value="No transitable por conflictos sociales">
              No transitable por conflictos sociales
            </option>
            <option value="Restricción vehicular">Restricción vehicular</option>
            <option value="No transitable por tráfico cerrado">
              No transitable por tráfico cerrado
            </option>
            <option value="Restricción vehicular especial">
              Restricción vehicular especial
            </option>
          </Form.Select>
          <Form.Select
            style={{ flex: "1" }}
            value={filterMunicipio}
            onChange={(e) => searchMunicipio(e.target.value)}
          >
            <option value="">Buscar municipio</option>
            {municipios.map((municipio) => (
              <option key={municipio.id} value={municipio.id}>
                {municipio.nombre}
              </option>
            ))}
          </Form.Select>
          <Button variant="secondary" onClick={handleFilterChange}>
            Filtrar
          </Button>
        </div>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Municipio Salida</th>
              <th>Municipio Llegada</th>
              <th>Motivo de Bloqueo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {carreteras.map((carretera) => (
              <tr key={carretera.id}>
                <td>{carretera.id}</td>
                <td>{carretera.nombre}</td>
                <td>{carretera.estado}</td>
                <td>{carretera.municipioSalida?.nombre}</td>
                <td>{carretera.municipioLlegada?.nombre}</td>
                <td>
                  {carretera.estado === "Bloqueada" && (
                    <Button
                      variant="info"
                      onClick={() => showMotivoBloqueo(carretera)}
                      className="me-2"
                    >
                      Ver motivo
                    </Button>
                  )}
                </td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => handleView(carretera)}
                    className="me-2"
                  >
                    Ver Carretera
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal para reportar incidente */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reportar Incidente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="incidentDetails">
              <Form.Label>Detalles del Incidente</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descripción del incidente"
                value={newIncidenteDescripcion}
                onChange={(e) => setNewIncidenteDescripcion(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="incidentImage">
              <Form.Label>Adjuntar Imagen</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleSaveIncident}>
            Guardar Incidente
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showModalIncidente}
        onHide={() => setShowModalIncidente(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Incidente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{incidente.descripcion}</p>
          <Image
            src={`http://localhost:3000/images/incidente/${incidente.foto}`}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
