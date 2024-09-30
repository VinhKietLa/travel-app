import React, { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import CountryModal from "./CountryModal";
import DraggableLegend from "./DraggableLegend";

const GlobeComponent = ({ isAuthenticated, setIsAuthenticated, csrfToken }) => {
  const globeRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [countriesData, setCountriesData] = useState([]); // Store countries from backend
  const [cityMarkers, setCityMarkers] = useState([]); // Store city markers
  const globeInstance = useRef(null); // Ref to store the globe instance
  const [showLogin, setShowLogin] = useState(false); // Show login form only when needed

  useEffect(() => {
    // Fetch countries and cities from the backend
    fetch("http://localhost:3000/countries", {
      credentials: "include", // Include session cookies
      headers: {
        "X-CSRF-Token": csrfToken, // Include the CSRF token here
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCountriesData(data); // Save country data to state
        const cities = data.flatMap((country) =>
          country.cities.map((city) => ({
            lat: parseFloat(city.latitude),
            lng: parseFloat(city.longitude),
            name: city.name,
          }))
        );
        setCityMarkers(cities); // Store city markers
      })
      .catch((error) => console.error("Error fetching countries:", error));

    // Initialize the globe only once
    globeInstance.current = Globe()(globeRef.current)
      .globeImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      )
      .bumpImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-topology.png"
      )
      .backgroundColor("#1C1C1E");

    // Fetch GeoJSON for country boundaries
    fetch(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
      .then((res) => res.json())
      .then((geojson) => {
        globeInstance.current
          .polygonsData(geojson.features)
          .polygonAltitude(0.01)
          .polygonStrokeColor(() => "#111")
          .onPolygonHover((hovered) => {
            setHoveredCountry(hovered ? hovered.properties.name : null);
          })
          .onPolygonClick((country) => {
            const countryName = country.properties.name;
            console.log(`Clicked on: ${countryName}`);
            handleCountryClick(countryName);
          });
      })
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []); // Empty dependency array to ensure this runs only once on mount

  // When countriesData changes, update the polygon colors and city markers
  useEffect(() => {
    if (countriesData.length > 0 && globeInstance.current) {
      globeInstance.current.polygonCapColor((d) => {
        const countryName = d.properties.name;
        const country = countriesData.find(
          (country) => country.name === countryName
        );

        // Determine color based on backend data
        if (country?.visited) {
          return "rgba(46, 204, 113, 1)"; // Green for visited
        } else if (country?.future_travel) {
          return "rgba(241, 196, 15, 1)"; // Yellow for wish to visit
        } else {
          return "rgba(231, 76, 60, 1)"; // Red for haven't visited
        }
      });

      // Add city markers to the globe
      globeInstance.current
        .pointsData(cityMarkers)
        .pointColor(() => "#2980B9")
        .pointAltitude(() => 0.01) // Increase the altitude (height) to make it larger
        .pointRadius(0.2); // Increase radius for larger markers
    }
  }, [countriesData, cityMarkers]); // This effect will only update when countriesData or cityMarkers change

  // Handle country click (only show modal if authenticated)
  const handleCountryClick = (countryName) => {
    const token = localStorage.getItem("token");
    if (!token || token === "true") {
      // Check for problematic values
      console.error("No valid token found!");
      return;
    }

    // First, try to find the country by name
    fetch(`http://localhost:3000/countries/find_by_name/${countryName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the JWT token in Authorization header
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // If found, return the country data
        } else {
          throw new Error("Error fetching country");
        }
      })
      .then((countryData) => {
        if (countryData) {
          setSelectedCountry({
            ...countryData,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching or creating country:", error);
      });
  };

  const handleCityAdded = (newCity, updatedCountry) => {
    if (!isAuthenticated) {
      setShowLogin(true); // Show login form if user isn't logged in
      return;
    }
    if (updatedCountry && updatedCountry.id) {
      setCountriesData((prevCountries) =>
        prevCountries.map((country) =>
          country.id === updatedCountry.id ? updatedCountry : country
        )
      );

      setCityMarkers((prevMarkers) => [
        ...prevMarkers,
        {
          lat: parseFloat(newCity.latitude),
          lng: parseFloat(newCity.longitude),
          name: newCity.name,
        },
      ]);
    } else {
      console.error("No valid updated country data found.");
    }
  };

  const handleCityDeleted = (countryId) => {
    if (!isAuthenticated) {
      setShowLogin(true); // Show login form if user isn't logged in
      return;
    }
    fetch(`http://localhost:3000/countries/${countryId}`, {
      credentials: "include", // Include session cookies
      headers: {
        "X-CSRF-Token": csrfToken, // Include the CSRF token here
      },
    })
      .then((response) => response.json())
      .then((updatedCountry) => {
        setCountriesData((prevCountries) =>
          prevCountries.map((country) =>
            country.id === updatedCountry.id ? updatedCountry : country
          )
        );
      })
      .catch((error) =>
        console.error("Error fetching updated country:", error)
      );
  };

  const handleNextLocationToggled = (countryId, newStatus) => {
    // if (!isAuthenticated) {
    //   alert("You must be logged in to add a city.");
    //   return;
    // }
    fetch(`http://localhost:3000/countries/${countryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken, // Include the CSRF token here
      },
      credentials: "include", // Include session cookies
      body: JSON.stringify({
        country: { future_travel: newStatus },
      }),
    })
      .then((response) => response.json())
      .then((updatedCountry) => {
        setCountriesData((prevCountries) =>
          prevCountries.map((country) =>
            country.id === updatedCountry.id ? updatedCountry : country
          )
        );
      })
      .catch((error) => console.error("Error updating country status:", error));
  };

  // Handle login form submission
  const handleLogin = (username, password) => {
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken, // Include the CSRF token here
      },
      credentials: "include", // Ensure cookies are sent with the request
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setIsAuthenticated(true); // Log in and allow editing
          setShowLogin(false); // Hide login form
        } else {
          alert("Invalid credentials");
        }
      })
      .catch((error) => console.error("Error during login:", error));
  };

  const [stats, setStats] = useState({
    total_countries_visited: 0,
    total_cities_visited: 0,
  });

  useEffect(() => {
    fetch("http://localhost:3000/travel_stats", {
      credentials: "include", // Include session cookies
    })
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
      })
      .catch((error) => console.error("Error fetching travel stats:", error));
  }, [countriesData]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={globeRef} style={{ height: "600px", width: "100%" }}></div>

      {hoveredCountry && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "5px 50px",
            backgroundColor: "#4A4A4A",
            color: "#fff",
            borderRadius: "5px",
            fontSize: "25px",
          }}
        >
          Hovering Over: {hoveredCountry}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "#333",
          padding: "10px",
          borderRadius: "5px",
          color: "#fff",
        }}
      >
        <h4>Travel Stats</h4>
        <p>Total Countries Visited: {stats.total_countries_visited}</p>
        <p>Total Cities Visited: {stats.total_cities_visited}</p>
      </div>

      {selectedCountry && (
        <CountryModal
          isOpen={!!selectedCountry}
          countryData={selectedCountry} // Pass the full selectedCountry object
          onClose={() => setSelectedCountry(null)}
          onCityAdded={handleCityAdded} // Pass handleCityAdded to CountryModal
          onCityDeleted={handleCityDeleted} // Pass handleCityDeleted to CountryModal
          onNextLocation={handleNextLocationToggled} // Pass handleNextLocation to CountryModal
          isAuthenticated={isAuthenticated} // Pass authentication status
          csrfToken={csrfToken} // Pass CSRF token to CountryModal
        />
      )}

      {showLogin && (
        <div>
          <h2>Login to edit data</h2>
          <input type="text" placeholder="Username" id="username" />
          <input type="password" placeholder="Password" id="password" />
          <button
            onClick={() =>
              handleLogin(
                document.getElementById("username").value,
                document.getElementById("password").value
              )
            }
          >
            Login
          </button>
        </div>
      )}

      <DraggableLegend>
        <div
          style={{
            backgroundColor: "#333",
            color: "#fff",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h4>Country</h4>
          <p>
            <span style={{ color: "rgba(46, 204, 113, 1)" }}>●</span> Visited
          </p>
          <p>
            <span style={{ color: "rgba(241, 196, 15, 1)" }}>●</span> Wish to
            visit next
          </p>
          <p>
            <span style={{ color: "rgba(231, 76, 60, 1)" }}>●</span> Haven't
            visited
          </p>
          <p>
            <span style={{ color: "#2980B9" }}>●</span> Cities visited
          </p>
        </div>
      </DraggableLegend>
    </div>
  );
};

export default GlobeComponent;
