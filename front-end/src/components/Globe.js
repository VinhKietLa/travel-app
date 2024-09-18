import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import CountryModal from "./CountryModal";

const Globe = () => {
  const globeRef = useRef();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const renderer = useRef(null);
  const scene = useRef(null);
  const camera = useRef(null);
  const globe = useRef(null);
  const isDragging = useRef(false); // To track dragging state
  const clickStart = useRef(null); // Track the position where the click starts

  useEffect(() => {
    // Load the GeoJSON file for country borders
    fetch("/data/countries.geojson")
      .then((response) => response.json())
      .then((geoData) => {
        setCountries(geoData.features);

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

          mapCountriesToGlobe(geoData.features);

          const animate = () => {
            requestAnimationFrame(animate);
            if (!isDragging.current) {
              globe.current.rotation.y += 0.01; // Auto-rotation
            }
            renderer.current.render(scene.current, camera.current);
          };
          animate();
        }
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });

    // Handle mouse down to track clicks and start dragging
    const handleMouseDown = (event) => {
      isDragging.current = false; // Reset dragging state
      clickStart.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    // Handle mouse move to rotate the globe and mark dragging
    const handleMouseMove = (event) => {
      if (!clickStart.current) return; // Ensure click started with mousedown

      const deltaMove = {
        x: event.clientX - clickStart.current.x,
        y: event.clientY - clickStart.current.y,
      };

      // Mark as dragging if the movement is more than a small threshold
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

    // Handle mouse up to detect clicks and open modal only if no dragging occurred
    const handleMouseUp = (event) => {
      if (!isDragging.current) {
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
            const clickedCountry = countries.find((country) => {
              return country.properties.ADMIN === clickedObject.userData.name;
            });

            if (clickedCountry) {
              setSelectedCountry(clickedCountry); // Open modal with country data
            }
          }
        }
      }

      // Reset click state and dragging
      clickStart.current = null;
      isDragging.current = false;
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [countries]);

  // Function to map GeoJSON countries onto the globe
  const mapCountriesToGlobe = (features) => {
    features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      const countryGroup = new THREE.Group();

      if (feature.geometry.type === "Polygon") {
        mapPolygonToGlobe(coordinates, countryGroup, feature.properties.ADMIN);
      } else if (feature.geometry.type === "MultiPolygon") {
        coordinates.forEach((polygon) => {
          mapPolygonToGlobe(polygon, countryGroup, feature.properties.ADMIN);
        });
      }

      globe.current.add(countryGroup);
    });
  };

  // Helper function to map a single polygon to the globe
  const mapPolygonToGlobe = (polygon, countryGroup, countryName) => {
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
        color: 0xffffff, // White color for country borders
        linewidth: 1,
        opacity: 0.8,
        transparent: true,
      });
      const line = new THREE.Line(geometry, material);

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
