import { Navbar, Nav } from "react-bootstrap";
import QuickMenu from "layouts/QuickMenu";

const NavbarTop = () => {
  return (
    <Navbar className="navbar-classic navbar navbar-expand-lg">
      <div className="d-flex justify-content-end w-100">
        <Nav className="navbar-right-wrap d-flex nav-top-wrap">
          <QuickMenu />
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavbarTop;