import "./App.css";
import Globe from "./components/Globe";
import Modal from "react-modal";
import { LoginComponent } from "./components/LoginComponent";
import { useState, useEffect } from "react";

Modal.setAppElement("#root");

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for toggling the login menu

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setIsMenuOpen(false); // Close menu on login
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev); // Toggle menu state
  };

  return (
    <div className="App">
      <div className="title">
        <h1>Vinh's Travel Map</h1>
        {/* Burger Icon */}
        <div className="burger-icon" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>
      <div className="login-container">
        {/* Show LoginComponent if menu is open and user is not authenticated */}
        {!isAuthenticated && isMenuOpen && (
          <LoginComponent setIsAuthenticated={handleLogin} />
        )}
        {isAuthenticated && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </div>
      <Globe isAuthenticated={isAuthenticated} />
    </div>
  );
}

export default App;
