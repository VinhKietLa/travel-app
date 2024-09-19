import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import axios from "axios";
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
  const clickedCountry = useRef(null); // Track the country clicked on mouse down
  const velocity = useRef({ x: 0, y: 0 }); // Velocity of spin
  const isMouseDown = useRef(false); // Track if the mouse is down
  const inertia = useRef({ x: 0, y: 0 }); // Inertia effect for continued spinning

  const MAX_SPEED = 0.02;
  const FRICTION = 0.98;

  useEffect(() => {
    axios
      .get("http://localhost:3000/countries")
      .then((response) => {
        setCountriesData(response.data); // Store the detailed countries data from the backend
      })
      .catch((error) => {
        console.error("Error fetching countries data:", error);
      });

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
            color: 0x000033, // Dark blue background for contrast
            wireframe: false,
          });
          globe.current = new THREE.Mesh(geometry, material);
          scene.current.add(globe.current);

          camera.current.position.z = 10;

          const animate = () => {
            requestAnimationFrame(animate);

            globe.current.rotation.y += inertia.current.x;
            globe.current.rotation.x += inertia.current.y;

            inertia.current.x *= FRICTION;
            inertia.current.y *= FRICTION;

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
    if (geoJsonCountries.length > 0 && countriesData.length > 0) {
      mapCountriesToGlobe(geoJsonCountries);
    }
  }, [geoJsonCountries, countriesData]);

  const mapCountriesToGlobe = (features) => {
    features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      let countryName = feature.properties.admin.trim().toLowerCase();

      const baseColor = 0xff0000; // Red for non-visited countries

      const country = countriesData.find(
        (c) => c.name.trim().toLowerCase() === countryName
      );

      const countryColor = country && country.visited ? 0x00ff00 : 0xff0000;

      const countryGroup = new THREE.Group();
      const color = country ? countryColor : baseColor;

      if (feature.geometry.type === "Polygon") {
        mapPolygonToGlobe(coordinates, countryGroup, color, country);
      } else if (feature.geometry.type === "MultiPolygon") {
        coordinates.forEach((polygon) => {
          mapPolygonToGlobe(polygon, countryGroup, color, country);
        });
      }

      globe.current.add(countryGroup);
    });
  };

  const mapPolygonToGlobe = (polygon, countryGroup, countryColor, country) => {
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
        color: countryColor,
        linewidth: 2,
        opacity: 1,
        transparent: true,
      });
      const line = new THREE.Line(geometry, material);

      line.userData = {
        isCountry: true,
        countryData: country,
      };

      countryGroup.add(line);
    });
  };

  // Mouse interaction handlers (from the old working code)
  const handleMouseDown = (event) => {
    if (!camera.current) return;

    isDragging.current = false;
    isMouseDown.current = true;
    clickStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    const mouse = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };

    raycaster.setFromCamera(mouse, camera.current);
    const intersects = raycaster.intersectObjects(scene.current.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (
        clickedObject &&
        clickedObject.userData &&
        clickedObject.userData.isCountry
      ) {
        clickedCountry.current = clickedObject.userData.countryData;
      }
    }
  };

  const handleMouseMove = (event) => {
    if (
      !clickStart.current ||
      !globe.current ||
      !isMouseDown.current ||
      !camera.current
    )
      return;

    const deltaMove = {
      x: event.clientX - clickStart.current.x,
      y: event.clientY - clickStart.current.y,
    };

    if (Math.abs(deltaMove.x) > 2 || Math.abs(deltaMove.y) > 2) {
      isDragging.current = true;
      globe.current.rotation.y += deltaMove.x * 0.005;
      globe.current.rotation.x += deltaMove.y * 0.005;
      velocity.current.x = deltaMove.x * 0.0005;
      velocity.current.y = deltaMove.y * 0.0005;

      clickStart.current = {
        x: event.clientX,
        y: event.clientY,
      };
    }
  };

  const handleMouseUp = (event) => {
    if (!camera.current) return;

    // If it's not dragging and the country clicked on mouse down matches mouse up
    if (!isDragging.current && clickedCountry.current) {
      if (clickedCountry.current && clickedCountry.current.visited) {
        setSelectedCountry(clickedCountry.current); // Only show modal if the country was visited
      }
    }

    inertia.current.x = Math.min(
      Math.max(velocity.current.x, -MAX_SPEED),
      MAX_SPEED
    );
    inertia.current.y = Math.min(
      Math.max(velocity.current.y, -MAX_SPEED),
      MAX_SPEED
    );

    clickStart.current = null;
    clickedCountry.current = null;
    isDragging.current = false;
    isMouseDown.current = false;
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
