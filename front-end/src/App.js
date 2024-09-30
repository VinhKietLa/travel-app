import "./App.css";
import Globe from "./components/Globe";
import Modal from "react-modal";
import { LoginComponent } from "./components/LoginComponent";
import { useState, useEffect } from "react";
Modal.setAppElement("#root");

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <div className="title">
        <h1>Vinh's Travel Map</h1>
        {!isAuthenticated && (
          <div className="login-container">
            <LoginComponent setIsAuthenticated={handleLogin} />
          </div>
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
