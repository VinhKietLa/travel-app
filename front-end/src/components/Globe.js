import React, { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import CountryModal from "./CountryModal";
import DraggableLegend from "./DraggableLegend";

const GlobeComponent = () => {
  const globeRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [countriesData, setCountriesData] = useState([]); // Store countries from backend
  const [cityMarkers, setCityMarkers] = useState([]); // Store city markers
  const globeInstance = useRef(null); // Ref to store the globe instance

  useEffect(() => {
    // Fetch countries and cities from the backend
    fetch("http://localhost:3000/countries")
      .then((res) => res.json())
      .then((data) => {
        setCountriesData(data); // Save country data to state
        // Extract city markers (latitude and longitude)
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
      .backgroundColor("#000");

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
          return "rgba(0, 255, 0, 0.7)"; // Green for visited
        } else if (country?.future_travel) {
          return "rgba(255, 255, 0, 0.7)"; // Yellow for wish to visit
        } else {
          return "rgba(255, 0, 0, 0.7)"; // Red for haven't visited
        }
      });

      // Add city markers to the globe
      globeInstance.current
        .pointsData(cityMarkers)
        .pointColor(() => "purple") // Change color to yellow
        .pointAltitude(() => 0.01) // Increase the altitude (height) to make it larger
        .pointRadius(0.2); // Increase radius for larger markers
    }
  }, [countriesData, cityMarkers]); // This effect will only update when countriesData or cityMarkers change
  // Handle country click
  const handleCountryClick = (countryName) => {
    // First, try to find the country by name
    fetch(
      `http://localhost:3000/countries/find_by_name/${encodeURIComponent(
        countryName
      )}`
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
          // Make sure both `id` and `name` are passed to the modal
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
    // Use the passed `updatedCountry` data
    if (updatedCountry && updatedCountry.id) {
      setCountriesData((prevCountries) =>
        prevCountries.map((country) =>
          country.id === updatedCountry.id
            ? updatedCountry // Replace the country with the updated one
            : country
        )
      );

      // Add the new city marker to the globe
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
    // Fetch the updated country data from the backend after deleting a city
    fetch(`http://localhost:3000/countries/${countryId}`)
      .then((response) => response.json())
      .then((updatedCountry) => {
        // Update the state with the updated country data
        setCountriesData((prevCountries) =>
          prevCountries.map((country) =>
            country.id === updatedCountry.id
              ? updatedCountry // Replace the country data with the updated one
              : country
          )
        );
      })
      .catch((error) =>
        console.error("Error fetching updated country:", error)
      );
  };

  const handleNextLocationToggled = (countryId, newStatus) => {
    fetch(`http://localhost:3000/countries/${countryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        country: { future_travel: newStatus },
      }),
    })
      .then((response) => response.json())
      .then((updatedCountry) => {
        // Update countriesData with the updated country status
        setCountriesData((prevCountries) =>
          prevCountries.map((country) =>
            country.id === updatedCountry.id ? updatedCountry : country
          )
        );
      })
      .catch((error) => {
        console.error("Error updating country status:", error);
      });
  };
  const [stats, setStats] = useState({
    total_countries_visited: 0,
    total_cities_visited: 0,
  });

  useEffect(() => {
    fetch("http://localhost:3000/travel_stats")
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
            left: "300px",
            padding: "5px 100px",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "5px",
            fontSize: "25px",
          }}
        >
          {hoveredCountry}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "5px",
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
        />
      )}

      {/* Draggable Legend */}
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
            <span style={{ color: "green" }}>●</span> Visited
          </p>
          <p>
            <span style={{ color: "yellow" }}>●</span> Wish to visit next
          </p>
          <p>
            <span style={{ color: "red" }}>●</span> Haven't visited
          </p>
          <p>
            <span style={{ color: "purple" }}>●</span> Cities visited
          </p>
        </div>
      </DraggableLegend>
    </div>
  );
};

export default GlobeComponent;
