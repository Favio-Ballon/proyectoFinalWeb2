// Dependencias
import { Navbar, Container, Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { useAuth } from "../hooks/useAuth";

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

function HeaderAdmin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = useAuth();
  console.log(user);
  if (!token) {
    window.location.href = "/login";
    }else

  return (
    <>
      <Navbar
        expand="lg"
        className="bg-body-tertiary"
        data-bs-theme="dark"
        bg="dark"
        fixed="top"
      >
        <Container>
          <Navbar.Brand href="/">Sistema de Carreteras</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Inicio</Nav.Link>

              <Nav.Link href="/Municipio">Municipio</Nav.Link>
              <Nav.Link href="/carretera">Carretera</Nav.Link>
              <Nav.Link href="/incidente">incidente</Nav.Link>

              {/* if admin in local the  usuario */}
              {user?.admin && <Nav.Link href="/usuario">Usuario</Nav.Link>}
            </Nav>
            <Nav>
              <Nav.Link onClick={() => handleLogout()} className="text-danger">
                Cerrar Sesión
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default HeaderAdmin;
