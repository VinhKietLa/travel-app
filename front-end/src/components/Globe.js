import React, { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import CountryModal from "./CountryModal";
import DraggableLegend from "./DraggableLegend";

const GlobeComponent = () => {
  const globeRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  // Example lists of countries
  const visitedCountries = ["Australia", "Canada", "France"];
  const wishToVisitCountries = ["Japan", "Brazil"];
  const notVisitedCountries = ["United States", "Germany"];

  useEffect(() => {
    const globe = Globe()(globeRef.current)
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
        globe
          .polygonsData(geojson.features)
          .polygonAltitude(0.01)
          .polygonCapColor((d) => {
            const countryName = d.properties.name;

            // Assign color based on category
            if (visitedCountries.includes(countryName)) {
              return "rgba(0, 255, 0, 0.7)"; // Green for visited
            } else if (wishToVisitCountries.includes(countryName)) {
              return "rgba(255, 255, 0, 0.7)"; // Yellow for wish to visit
            } else if (notVisitedCountries.includes(countryName)) {
              return "rgba(255, 0, 0, 0.7)"; // Red for haven't visited
            } else {
              return "rgba(255, 255, 255, 0.3)"; // Default color
            }
          })
          .polygonStrokeColor(() => "#111")
          .onPolygonHover((hovered) => {
            setHoveredCountry(hovered ? hovered.properties.name : null);
          });

        globe.onPolygonClick((country) => {
          const countryName = country.properties.name;
          console.log(`Clicked on: ${countryName}`);
          setSelectedCountry(countryName);
        });
      })
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

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
