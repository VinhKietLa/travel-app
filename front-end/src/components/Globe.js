import React, { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import CountryModal from "./CountryModal";

const GlobeComponent = () => {
  const globeRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  useEffect(() => {
    const globe = Globe()(globeRef.current)
      .globeImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      )
      .bumpImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-topology.png"
      )
      .backgroundColor("#000");

    fetch(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
      .then((res) => res.json())
      .then((geojson) => {
        globe
          .polygonsData(geojson.features)
          .polygonAltitude(0.01)
          .polygonCapColor(() => "rgba(255, 255, 255, 0.3)")
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
    <div>
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
    </div>
  );
};

export default GlobeComponent;
