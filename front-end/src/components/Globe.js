import React, { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import CountryModal from "./CountryModal"; // Assuming this is your existing modal component

const GlobeComponent = () => {
  const globeRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null); // To track selected country

  useEffect(() => {
    // Initialize globe with a natural Earth texture
    const globe = Globe()(globeRef.current)
      .globeImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      )
      .bumpImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-topology.png"
      )
      .backgroundColor("#000"); // Black background for contrast

    // Fetch a GeoJSON for country boundaries
    fetch(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
      .then((res) => res.json())
      .then((geojson) => {
        globe
          .polygonsData(geojson.features)
          .polygonAltitude(0.01) // Slightly raise polygons to avoid clipping with texture
          .polygonCapColor(() => "rgba(255, 255, 255, 0.3)") // Semi-transparent white fill
          .polygonStrokeColor(() => "#111"); // Dark borders

        // Handle country click
        globe.onPolygonClick((country) => {
          const countryName = country.properties.name;
          console.log(`Clicked on: ${countryName}`);
          setSelectedCountry(countryName); // Set the clicked country to open the modal
        });
      })
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  return (
    <div>
      <div ref={globeRef} style={{ height: "600px", width: "100%" }}></div>

      {/* Country Modal */}
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
