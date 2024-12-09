import { useEffect, useState } from "react";
import { Map, useMap, useMapsLibrary, Marker } from "@vis.gl/react-google-maps";
import axios from "axios";
import { Button, Form, Modal, Table } from "react-bootstrap";
import HeaderAdmin from "../components/headerAdmin";
import { useAuth } from "../hooks/useAuth";

export default function Carreteras() {
  const token = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));
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
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [currentCarretera, setCurrentCarretera] = useState({
    id: 0,
    nombre: "",
    estado: "",
    razonBloqueo: "",
    municipioSalidaId: 0,
    municipioLlegadaId: 0,
    puntos: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [puntos, setPuntos] = useState([]);
  const [filterByLlegada, setFilterByLlegada] = useState(false);
  const [filterMunicipio, setFilterMunicipio] = useState("");
  const [carreteraFijo, setCarreteraFijo] = useState([]);

  useEffect(() => {
    if (!maps) return;
    fetchCarreteras();
    fetchMunicipios();
    setLoading(false);
  }, [maps]);

  useEffect(() => {
    if (carreteras.length > 0) {
      addPolylineCircle();
    } else {
      polylines.forEach((polyline) => polyline.setMap(null));
      circles.forEach((circle) => circle.setMap(null));
    }
  }, [maps, carreteras]);

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

  const addPolylineCircle = () => {
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

  const cleanCurrentCarretera = () => {
    setCurrentCarretera({
      id: 0,
      nombre: "",
      estado: "",
      razonBloqueo: "",
      municipioSalidaId: 0,
      municipioLlegadaId: 0,
      puntos: [],
    });
  };

  const handleView = (carretera) => {
    setCurrentCarretera(carretera);

    polylines.forEach((polyline) => polyline.setMap(null));
    circles.forEach((circle) => circle.setMap(null));
    const polylineArray = [
      {
        lat: parseFloat(carretera.municipioSalida.latitud),
        lng: parseFloat(carretera.municipioSalida.longitud),
      },
      ...carretera.puntos.map((punto) => ({
        lat: parseFloat(punto.latitud),
        lng: parseFloat(punto.longitud),
      })),
      {
        lat: parseFloat(carretera.municipioLlegada.latitud),
        lng: parseFloat(carretera.municipioLlegada.longitud),
      },
    ];

    const newCircles = [];

    const polyline = new maps.Polyline({
      path: polylineArray,
      geodesic: true,
      strokeColor: "#00ff00",
      strokeOpacity: 1.0,
      strokeWeight: 5,
    });

    polyline.setMap(map);

    polylineArray.forEach((punto) => {
      const circle = new maps.Circle({
        strokeColor: "#00ff00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#00ff00",
        fillOpacity: 1,
        center: punto,
        radius: 1500,
      });
      circle.setMap(map);
      newCircles.push(circle);
    });

    const middle = Math.floor(polylineArray.length / 2);

    map.setCenter(polylineArray[middle]);

    map.setZoom(9);

    setPolylines([polyline]);
    setCircles(newCircles);
  };

  const handleEdit = (carretera) => {
    setCurrentCarretera({
      id: carretera.id,
      nombre: carretera.nombre,
      estado: carretera.estado,
      razonBloqueo: carretera.razonBloqueo,
      municipioSalidaId: carretera.municipioSalidaId,
      municipioLlegadaId: carretera.municipioLlegadaId,
      puntos: carretera.puntos,
    });

    setEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta carretera?")) {
      axios
        .delete(`http://localhost:3000/carretera/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          alert("Carretera eliminada correctamente.");
          fetchCarreteras();
        })
        .catch((error) => console.error("Error eliminando carretera:", error));
    }
  };

  const handleCenterChanged = (map) => {
    const newCenter = map.detail.center;
    setMapCenter({
      lat: newCenter.lat,
      lng: newCenter.lng,
    });
  };

  const handleSave = () => {
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `http://localhost:3000/carretera/${currentCarretera.id}`
      : "http://localhost:3000/carretera";

    var carretera = {
      nombre: currentCarretera.nombre,
      estado: "Activa",
      razonBloqueo: "",
      municipioSalidaId: currentCarretera.municipioSalidaId,
      municipioLlegadaId: currentCarretera.municipioLlegadaId,
      usuarioId: user.id,
    };

    console.log(carretera);

    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carretera),
    })
      .then(() => {
        alert(
          editing
            ? "Carretera actualizada correctamente."
            : "Carretera creada correctamente."
        );
        setShowModal(false);
        fetchCarreteras();
        cleanCurrentCarretera();
      })
      .catch((error) => console.error("Error guardando carretera:", error));
  };

  const handleGuardarPuntos = () => {
    const method = "POST";
    const url = `http://localhost:3000/punto/carretera/${currentCarretera.id}`;

    const newPuntos = puntos.slice(1, puntos.length - 1).map((punto) => ({
      latitud: punto.lat,
      longitud: punto.lng,
      carreteraId: currentCarretera.id,
    }));
    console.log(newPuntos);
    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ puntos: newPuntos }),
    })
      .then(() => {
        alert("Puntos guardados correctamente.");
        fetchCarreteras();
        cleanCurrentCarretera();
        setIsSelectingPoints(false);
        setPuntos([]);
      })
      .catch((error) => console.error("Error guardando puntos:", error));
  };

  useEffect(() => {
    if (isSelectingPoints) {
      map.setCenter(puntos[puntos.length - 1]);
      map.setZoom(9);
      map.addListener("click", (e) => {
        if (isSelectingPoints) {
          const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          setPuntos((prevPuntos) => [
            ...prevPuntos.slice(0, prevPuntos.length - 1),
            newPoint,
            prevPuntos[prevPuntos.length - 1],
          ]);
        }
      });
    }
  }, [isSelectingPoints]);

  useEffect(() => {
    if (isSelectingPoints) {
      console.log("Puntos: ", puntos);
      if (puntos.length < 2) return;
      polylines.forEach((polyline) => polyline.setMap(null));
      circles.forEach((circle) => circle.setMap(null));
      const polyline = new maps.Polyline({
        path: puntos,
        geodesic: true,
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        zIndex: 1,
      });
      polyline.setMap(map);
      setPolylines([polyline]);

      puntos.forEach((punto) => {
        const circle = new maps.Circle({
          strokeColor: "#00ff00",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#00ff00",
          fillOpacity: 1,
          center: punto,
          radius: 1500,
          zIndex: 2,
          draggable: true,
          onClick: () => {
            console.log("Punto clickeado");
          },
        });

        circle.addListener("dragend", (e) => {
          const newPuntos = puntos.map((p) => {
            if (p === punto) {
              return { lat: e.latLng.lat(), lng: e.latLng.lng() };
            }
            return p;
          });
          setPuntos(newPuntos);
        });

        circle.addListener("click", () => {
          const newPuntos = puntos.filter((p) => p !== punto);
          setPuntos(newPuntos);
        });

        circle.setMap(map);
        setCircles((prevCircles) => [...prevCircles, circle]);
      });
    }
  }, [puntos]);

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
        <h1 className="mb-4">Mapa de Municipios</h1>
        {!isSelectingPoints ? (
          <>
            <Button
              className="mb-4"
              variant="success"
              onClick={() => {
                cleanCurrentCarretera(), setEditing(false), setShowModal(true);
              }}
            >
              Añadir carretera
            </Button>
          </>
        ) : (
          <>
            <Button
              className="mb-4"
              variant="danger"
              onClick={() => {
                setIsSelectingPoints(false), setPuntos([]);
                cleanCurrentCarretera(), addPolylineCircle();
              }}
            >
              Cancelar
            </Button>
            <Button
              className="mb-4"
              variant="success"
              onClick={() => {
                handleGuardarPuntos();
              }}
            >
              Guardar Puntos
            </Button>
          </>
        )}
        {loading && <p>Loading...</p>}
        {!loading && (
          <>
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
            <h2 className="mt-4">Lista de Carreteras</h2>
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
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Muncipio Llegada</th>
                  <th>Municipio Salida</th>
                  <th>Razón de Bloqueo</th>
                  {user?.admin && <th>Usuario</th>}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carreteras.map((carretera) => (
                  <tr key={carretera.id}>
                    <td>{carretera.id}</td>
                    <td>{carretera.nombre}</td>
                    <td>{carretera.estado}</td>
                    <td>{carretera.municipioLlegada?.nombre}</td>
                    <td>{carretera.municipioSalida?.nombre}</td>
                    <td>{carretera.razonBloqueo}</td>
                    {user?.admin && <td>{carretera.usuario?.nombre}</td>}
                    <td>
                      <Button
                        variant="info"
                        onClick={() => {
                          {
                            currentCarretera?.id === carretera.id
                              ? (addPolylineCircle(), cleanCurrentCarretera())
                              : handleView(carretera);
                          }
                        }}
                        className="me-2"
                      >
                        {currentCarretera?.id === carretera.id
                          ? "Ver todas"
                          : "Ver"}
                      </Button>
                      <Button
                        variant="warning"
                        onClick={() => handleEdit(carretera)}
                        className="me-2"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(carretera.id)}
                      >
                        Eliminar
                      </Button>
                      <Button
                        disabled={isSelectingPoints ? true : false}
                        variant="primary"
                        onClick={() => {
                          setIsSelectingPoints(true);
                          setCurrentCarretera(carretera);
                          const punto = [
                            carretera.municipioSalida
                              ? {
                                  lat: carretera.municipioSalida.latitud,
                                  lng: carretera.municipioSalida.longitud,
                                }
                              : null,
                            ...carretera.puntos.map((punto) => ({
                              lat: punto.latitud,
                              lng: punto.longitud,
                            })),
                            carretera.municipioLlegada
                              ? {
                                  lat: carretera.municipioLlegada.latitud,
                                  lng: carretera.municipioLlegada.longitud,
                                }
                              : null,
                          ];
                          setPuntos(punto);
                        }}
                      >
                        Seleccionar Puntos
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Editar Carretera" : "Añadir Carretera"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={currentCarretera.nombre}
                onChange={(e) =>
                  setCurrentCarretera({
                    ...currentCarretera,
                    nombre: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Municipio de llegada</Form.Label>
              <Form.Select
                value={currentCarretera.municipioLlegadaId}
                onChange={(e) =>
                  setCurrentCarretera({
                    ...currentCarretera,
                    municipioLlegadaId: parseInt(e.target.value),
                  })
                }
              >
                <option>Seleccione un municipio</option>
                {municipios.map((municipio) => (
                  <option key={municipio.id} value={municipio.id}>
                    {municipio.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Municipio de Salida</Form.Label>
              <Form.Select
                value={currentCarretera.municipioSalidaId}
                onChange={(e) =>
                  setCurrentCarretera({
                    ...currentCarretera,
                    municipioSalidaId: parseInt(e.target.value),
                  })
                }
              >
                <option>Seleccione un municipio</option>
                {municipios.map((municipio) => (
                  <option key={municipio.id} value={municipio.id}>
                    {municipio.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editing ? "Guardar Cambios" : "Crear"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
