import React, { useState } from "react";

// Move handleLogout outside so it can be exported
const handleLogout = (setIsAuthenticated) => {
  fetch("http://localhost:3000/logout", {
    method: "DELETE",
    credentials: "include", // Ensure cookies are sent with the request
  })
    .then(() => {
      setIsAuthenticated(false);
      localStorage.removeItem("authenticated"); // Clear session locally
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
};

const LoginComponent = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Logged in successfully") {
          localStorage.setItem("authenticated", "true"); // Save login state
          setIsAuthenticated(true);
        } else {
          alert("Invalid credentials");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
      });
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

// Export both the LoginComponent and the handleLogout function
export { LoginComponent, handleLogout };
