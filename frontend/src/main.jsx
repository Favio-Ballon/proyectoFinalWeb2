import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import { APIProvider } from "@vis.gl/react-google-maps";
import Municipios from "./admin/listMunicipio.jsx";
import Carreteras from "./admin/listCarretera.jsx";
import Incidentes from "./admin/listIncidente.jsx";
import MyMap from "./admin/pruebaMapa.jsx";
import UsuarioList from "./admin/listUsuarios.jsx";
import Login from "./login.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/municipio",
    element: <Municipios />,
  },
  {
    path: "/carretera",
    element: <Carreteras />,
  },
  {
    path: "/prueba",
    element: <MyMap />,
  },
  {
    path: "/incidente",
    element: <Incidentes />,
  },
  {
    path: "/usuario",
    element: <UsuarioList />,
  },
  {
    path: "/login",
    element: <Login />,
  }
]);
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
console.log("Tu api key de google maps: ", API_KEY);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <APIProvider apiKey={API_KEY}>
      <RouterProvider router={router} />
    </APIProvider>
  </StrictMode>
);
