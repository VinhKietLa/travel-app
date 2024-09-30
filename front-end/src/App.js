import "./App.css";
import Globe from "./components/Globe";
import Modal from "react-modal";
import { LoginComponent, handleLogout } from "./components/LoginComponent";
import { useState, useEffect } from "react";
Modal.setAppElement("#root");

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Retrieved token from localStorage:", token); // Add this
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (token) => {
    console.log("Setting token in localStorage:", token);
    localStorage.setItem("token", token);
    setIsAuthenticated(true); // Ensure this only sets the state and not the token
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <div className="title">
        <h1>Vinh's Travel Map</h1>
      </div>

      {isAuthenticated && (
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      )}

      {!isAuthenticated && (
        <div className="login-container">
          <LoginComponent setIsAuthenticated={handleLogin} />
        </div>
      )}

      <Globe isAuthenticated={isAuthenticated} />
    </div>
  );
}

export default App;
