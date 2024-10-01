import React, { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import CountryModal from "./CountryModal";
import DraggableLegend from "./DraggableLegend";
import "./Globe.css";

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
    fetch(`${process.env.REACT_APP_API_URL}/countries`, {
      credentials: "include", // Include session cookies
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
    // First, try to find the country by name
    fetch(
      `${process.env.REACT_APP_API_URL}/countries/find_by_name/${countryName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
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
    fetch(`${process.env.REACT_APP_API_URL}/countries/${countryId}`, {
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
    const token = localStorage.getItem("token");

    if (!isAuthenticated) {
      alert("You must be logged in to add a city.");
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/countries/${countryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        country: { future_travel: newStatus },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error updating country status");
        }
        return response.json();
      })
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
    fetch(`${process.env.REACT_APP_API_URL}/login`, {
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
    fetch(`${process.env.REACT_APP_API_URL}/travel_stats`, {
      credentials: "include", // Include session cookies
    })
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
      })
      .catch((error) => console.error("Error fetching travel stats:", error));
  }, [countriesData]);

  return (
    <div className="globeContainer">
      <div id="globe" ref={globeRef}></div>

      {/* //Hover country text// */}
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
      {/* //Travel stats// */}
      <div className="travelStats">
        <h4>Travel Stats</h4>
        <p>Total Countries Visited: {stats.total_countries_visited}</p>
        <p>Total Cities Visited: {stats.total_cities_visited}</p>
      </div>
      {/* //Country status// */}
      <div className="countryStatus">
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
      {/* //Country modal// */}
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
    </div>
  );
};

export default GlobeComponent;
