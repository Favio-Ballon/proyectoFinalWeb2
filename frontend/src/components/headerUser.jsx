import {
  Navbar,
  Container,
  Nav,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { useAuth } from "../hooks/useAuth";

function HeaderPublic() {
  const token = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

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
            </Nav>
            <Nav>
              {token ? (
                <Nav.Link
                  onClick={() => handleLogout()}
                  className="btn btn-primary text-white"
                >
                  Cerrar Sesión
                </Nav.Link>
              ) : (
                <Nav.Link href="/login" className="btn btn-primary text-white">
                  Iniciar Sesión
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default HeaderPublic;
