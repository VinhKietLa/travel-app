import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import axios from "axios"; // Ensure axios is installed
import CountryModal from "./CountryModal";

const Globe = () => {
  const globeRef = useRef();
  const [geoJsonCountries, setGeoJsonCountries] = useState([]); // GeoJSON data for globe rendering
  const [countriesData, setCountriesData] = useState([]); // Detailed data from backend
  const [selectedCountry, setSelectedCountry] = useState(null);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const renderer = useRef(null);
  const scene = useRef(null);
  const camera = useRef(null);
  const globe = useRef(null);
  const isDragging = useRef(false);
  const clickStart = useRef(null);

  useEffect(() => {
    // Fetch country details (hardcoded data) from the backend
    axios
      .get("http://localhost:3000/countries")
      .then((response) => {
        setCountriesData(response.data); // Store the detailed countries data from the backend
      })
      .catch((error) => {
        console.error("Error fetching countries data:", error);
      });

    // Load the GeoJSON file for country borders (for globe rendering)
    fetch("/data/countries.geojson")
      .then((response) => response.json())
      .then((geoData) => {
        setGeoJsonCountries(geoData.features);

        if (!renderer.current && !scene.current && !camera.current) {
          scene.current = new THREE.Scene();
          camera.current = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
          );
          renderer.current = new THREE.WebGLRenderer();
          renderer.current.setSize(window.innerWidth, window.innerHeight);
          globeRef.current.appendChild(renderer.current.domElement);

          const geometry = new THREE.SphereGeometry(5, 32, 32);
          const material = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            wireframe: false,
          });
          globe.current = new THREE.Mesh(geometry, material);
          scene.current.add(globe.current);

          camera.current.position.z = 10;

          const animate = () => {
            requestAnimationFrame(animate);
            if (!isDragging.current && globe.current) {
              globe.current.rotation.y += 0.01;
            }
            renderer.current.render(scene.current, camera.current);
          };
          animate();
        }
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }, []);

  useEffect(() => {
    // Only proceed if both geoJsonCountries and countriesData are loaded
    if (geoJsonCountries.length > 0 && countriesData.length > 0) {
      console.log("Both geoJsonCountries and countriesData are loaded.");
      mapCountriesToGlobe(geoJsonCountries);
    } else {
      console.log("Waiting for geoJsonCountries or countriesData to load...");
    }
  }, [geoJsonCountries, countriesData]);

  // Function to map GeoJSON countries onto the globe
  const mapCountriesToGlobe = (features) => {
    features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      let countryName = feature.properties.admin.trim().toLowerCase(); // Normalize GeoJSON country name

      console.log(`GeoJSON countryName (admin): ${countryName}`);

      // Check if this country exists in hardcoded countriesData
      const country = countriesData.find(
        (c) => c.name.trim().toLowerCase() === countryName
      );

      // Set color based on whether the country is visited or not
      const countryColor = country && country.visited ? 0x00ff00 : 0xff0000; // Green for visited, Red for not visited
      console.log(
        `Coloring country: ${countryName} as ${
          countryColor === 0x00ff00 ? "Green" : "Red"
        }`
      );

      const countryGroup = new THREE.Group();

      // Render countries as polygons or multipolygons
      if (feature.geometry.type === "Polygon") {
        mapPolygonToGlobe(coordinates, countryGroup, countryColor);
      } else if (feature.geometry.type === "MultiPolygon") {
        coordinates.forEach((polygon) => {
          mapPolygonToGlobe(polygon, countryGroup, countryColor);
        });
      }

      globe.current.add(countryGroup); // Add the country group to the globe
    });
  };

  // Helper function to map a single polygon to the globe
  const mapPolygonToGlobe = (polygon, countryGroup, countryColor) => {
    polygon.forEach((coordSet) => {
      const points = [];

      coordSet.forEach(([longitude, latitude]) => {
        const phi = (90 - latitude) * (Math.PI / 180);
        const theta = (longitude + 180) * (Math.PI / 180);

        const x = 5 * Math.sin(phi) * Math.cos(theta);
        const y = 5 * Math.cos(phi);
        const z = 5 * Math.sin(phi) * Math.sin(theta);

        points.push(new THREE.Vector3(x, y, z));
      });

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: countryColor, // Set the color (Green or Red)
        linewidth: 1,
        opacity: 0.8,
        transparent: true,
      });
      const line = new THREE.Line(geometry, material);
      countryGroup.add(line);
    });
  };

  // Mouse interaction handlers
  const handleMouseDown = (event) => {
    isDragging.current = false;
    clickStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleMouseMove = (event) => {
    if (!clickStart.current || !globe.current) return; // Check if globe is initialized

    const deltaMove = {
      x: event.clientX - clickStart.current.x,
      y: event.clientY - clickStart.current.y,
    };

    if (Math.abs(deltaMove.x) > 2 || Math.abs(deltaMove.y) > 2) {
      isDragging.current = true;
      globe.current.rotation.y += deltaMove.x * 0.005;
      globe.current.rotation.x += deltaMove.y * 0.005;
      clickStart.current = {
        x: event.clientX,
        y: event.clientY,
      };
    }
  };

  const handleMouseUp = (event) => {
    if (!isDragging.current && globe.current) {
      const mouse = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
      raycaster.setFromCamera(mouse, camera.current);

      const intersects = raycaster.intersectObjects(
        scene.current.children,
        true
      );
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        if (
          clickedObject &&
          clickedObject.userData &&
          clickedObject.userData.isCountry
        ) {
          const countryId = clickedObject.userData.id; // Get the country ID from userData

          // Find the country in the fetched countries data
          const country = countriesData.find((c) => c.id === countryId);

          if (country) {
            setSelectedCountry(country); // Show country details in modal
          }
        }
      }
    }

    clickStart.current = null;
    isDragging.current = false;
  };

  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);

  return (
    <div>
      <div ref={globeRef} />
      <CountryModal
        isOpen={!!selectedCountry}
        countryData={selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
    </div>
  );
};

export default Globe;
