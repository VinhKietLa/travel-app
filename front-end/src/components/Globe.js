import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import CountryModal from "./CountryModal";

const Globe = () => {
  const globeRef = useRef();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Use useRef to persist these objects across renders
  const renderer = useRef(null);
  const scene = useRef(null);
  const camera = useRef(null);
  const globe = useRef(null);
  const isDragging = useRef(false); // To track dragging state
  const previousMousePosition = useRef({ x: 0, y: 0 }); // Track previous mouse position
  const spinSpeed = useRef(0.01); // Control the initial spin speed

  useEffect(() => {
    // Load the GeoJSON file for country borders
    fetch("/data/countries.geojson")
      .then((response) => response.json())
      .then((geoData) => {
        setCountries(geoData.features); // Save the GeoJSON country features

        // Set up the Three.js scene (ensure it's only set up once)
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

          // Create a sphere for the globe (earth)
          const geometry = new THREE.SphereGeometry(5, 32, 32);
          const material = new THREE.MeshBasicMaterial({
            color: 0x87ceeb, // Sky-blue color for the earth
            wireframe: false,
          });
          globe.current = new THREE.Mesh(geometry, material);
          scene.current.add(globe.current);

          camera.current.position.z = 10;

          // Map country borders onto the globe
          mapCountriesToGlobe(geoData.features);

          // Animation function to spin the globe
          const animate = () => {
            requestAnimationFrame(animate);

            // If the user is not dragging, continue auto-rotation
            if (!isDragging.current) {
              globe.current.rotation.y += spinSpeed.current;
            }

            renderer.current.render(scene.current, camera.current);
          };
          animate();
        }
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });

    // Detect clicks on the globe
    const handleMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera.current);

      const intersects = raycaster.intersectObjects(
        scene.current.children,
        true
      ); // Enable recursive intersection

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // Check if the clicked object is a country by looking at its userData
        if (
          clickedObject &&
          clickedObject.userData &&
          clickedObject.userData.isCountry
        ) {
          const clickedCountry = countries.find((country) => {
            return country.properties.ADMIN === clickedObject.userData.name;
          });

          if (clickedCountry) {
            setSelectedCountry(clickedCountry); // Open the modal with the clicked country data
          }
        } else {
          // Close the modal if clicking on empty space or a non-country object
          setSelectedCountry(null);
        }
      } else {
        // Close the modal if no object was clicked
        setSelectedCountry(null);
      }
    };

    // Handle mouse down to start dragging
    const handleMouseDown = (event) => {
      isDragging.current = true;
      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    // Handle mouse move to rotate the globe
    const handleMouseMove = (event) => {
      if (!isDragging.current) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.current.x,
        y: event.clientY - previousMousePosition.current.y,
      };

      globe.current.rotation.y += deltaMove.x * 0.005; // Adjust rotation speed
      globe.current.rotation.x += deltaMove.y * 0.005; // You can control X rotation as well

      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
      isDragging.current = false; // Stop dragging
    };

    window.addEventListener("click", handleMouseClick);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("click", handleMouseClick);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [countries]);

  // Function to map GeoJSON countries onto the globe using line segments
  const mapCountriesToGlobe = (features) => {
    features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      const countryGroup = new THREE.Group();

      // Check if we are dealing with a Polygon or MultiPolygon
      if (feature.geometry.type === "Polygon") {
        mapPolygonToGlobe(coordinates, countryGroup, feature.properties.ADMIN);
      } else if (feature.geometry.type === "MultiPolygon") {
        coordinates.forEach((polygon) => {
          mapPolygonToGlobe(polygon, countryGroup, feature.properties.ADMIN);
        });
      }

      // Add the country group (either a single or multiple polygons) to the globe
      globe.current.add(countryGroup);
    });
  };

  // Helper function to map a single polygon to the globe
  const mapPolygonToGlobe = (polygon, countryGroup, countryName) => {
    polygon.forEach((coordSet) => {
      const points = [];

      coordSet.forEach(([longitude, latitude]) => {
        // Convert latitude and longitude to 3D coordinates
        const phi = (90 - latitude) * (Math.PI / 180);
        const theta = (longitude + 180) * (Math.PI / 180);

        const x = 5 * Math.sin(phi) * Math.cos(theta);
        const y = 5 * Math.cos(phi);
        const z = 5 * Math.sin(phi) * Math.sin(theta);

        points.push(new THREE.Vector3(x, y, z));
      });

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff, // White color for country borders
        linewidth: 1,
        opacity: 0.8,
        transparent: true,
      });
      const line = new THREE.Line(geometry, material);

      // Assign userData so we can identify this country later
      line.userData = {
        isCountry: true,
        name: countryName,
      };

      countryGroup.add(line);
    });
  };

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
