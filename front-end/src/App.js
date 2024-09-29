import "./App.css";
import Globe from "./components/Globe";
import Modal from "react-modal";
import { LoginComponent, handleLogout } from "./components/LoginComponent";
import { useState, useEffect } from "react";
Modal.setAppElement("#root");

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if the user is logged in when the app loads
  useEffect(() => {
    const authStatus = localStorage.getItem("authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      fetch("http://localhost:3000/logged_in")
        .then((response) => response.json())
        .then((data) => {
          if (data.logged_in) {
            setIsAuthenticated(true);
            localStorage.setItem("authenticated", "true");
          } else {
            setIsAuthenticated(false);
            localStorage.removeItem("authenticated");
          }
        });
    }
  }, []);

  return (
    <div className="App">
      <div className="title">
        <h1>Vinh's Travel Map</h1>
      </div>

      {/* Conditionally render the Logout button */}
      {isAuthenticated && (
        <button
          onClick={() => handleLogout(setIsAuthenticated)}
          className="logout-button"
        >
          Logout
        </button>
      )}

      {/* Show the LoginComponent when not logged in */}
      {!isAuthenticated && (
        <div className="login-container">
          <LoginComponent setIsAuthenticated={setIsAuthenticated} />
        </div>
      )}

      {/* Show the globe regardless of login */}
      <Globe
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
    </div>
  );
}

export default App;
