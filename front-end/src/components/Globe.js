import React, { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import CountryModal from "./CountryModal";
import DraggableLegend from "./DraggableLegend";

const GlobeComponent = () => {
  const globeRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [countriesData, setCountriesData] = useState([]); // Store countries from backend
  const globeInstance = useRef(null); // Ref to store the globe instance

  useEffect(() => {
    // Fetch countries from the backend
    fetch("http://localhost:3000/countries")
      .then((res) => res.json())
      .then((data) => {
        setCountriesData(data); // Save country data to state
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

  // When countriesData changes, update the polygon colors
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
    }
  }, [countriesData]); // This effect will only update the colors when countriesData changes

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
          setSelectedCountry(countryData.name); // Open modal if country found
        }
      })
      .catch((error) => {
        console.error("Error fetching or creating country:", error);
      });
  };

  return (
    <div style={{ position: "relative" }}>
      <div ref={globeRef} style={{ height: "600px", width: "100%" }}></div>

      {hoveredCountry && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "5px 10px",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "5px",
          }}
        >
          {hoveredCountry}
        </div>
      )}

      {selectedCountry && (
        <CountryModal
          isOpen={!!selectedCountry}
          countryData={{ name: selectedCountry }}
          onClose={() => setSelectedCountry(null)}
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
          <h4>Legend</h4>
          <p>
            <span style={{ color: "green" }}>●</span> Visited
          </p>
          <p>
            <span style={{ color: "yellow" }}>●</span> Wish to visit next
          </p>
          <p>
            <span style={{ color: "red" }}>●</span> Haven't visited
          </p>
        </div>
      </DraggableLegend>
    </div>
  );
};

export default GlobeComponent;
