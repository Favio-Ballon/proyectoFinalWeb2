// Dependencias
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
function HeaderAdmin() {
    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark" bg="dark" fixed="top">
                <Container>
                    <Navbar.Brand href="/">Spotify</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <NavDropdown title="Canciones" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/Canciones">Lista</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/Cancion/create">Crear</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Genero" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/genero">Lista</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/genero/create">Crear</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Artista" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/artista">Lista</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/artista/create">Crear</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Album" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/album">Lista</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/album/create">Crear</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default HeaderAdmin;
