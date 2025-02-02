/* ------------------------------------------------ */
/* ---------------- Navigation Bar -------------- */
/* ------------------------------------------------ */

// Import necessary dependencies
import '../css/App.css';
import { Link } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import logo from '../imgs/logo.png';

/**
 * Navigationbar Component
 * Renders the main navigation bar at the top of the application.
 *
 * @returns {JSX.Element} The navigation bar component.
 */
export default function Navigationbar() {
  /**
   * Reloads the home page when the logo is clicked.
   */
  const reloadHome = () => {
    window.location.reload(false);
  };

  return (
    <div>
      {/* Navigation bar positioned at the top of the page */}
      <Navbar collapseOnSelect expand="sm" style={{ backgroundColor: "#57C528" }} variant="dark">
        <Container className="blueFont">
          {/* Brand logo and home link */}
          <Navbar.Brand onClick={reloadHome}>
            <img src={logo} alt="Logo" className="logo" />
            <Link to="/" className="titleNavbar">
              <p className="subtitleNavbar">
                The statistics of your routes in a few clicks!
              </p>
            </Link>
          </Navbar.Brand>
          
          {/* Navbar toggler for responsive design */}
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            {/* Link to global statistics page */}
            <Link to="boss-stats" className="subtitleNavbar" style={{ marginLeft: "20px" }}>
              Global Statistics
            </Link>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}
