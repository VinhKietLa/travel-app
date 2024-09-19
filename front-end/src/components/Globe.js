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

            // Disable globe rotation when modal is open
            if (!selectedCountry) {
              globe.current.rotation.y += inertia.current.x;
              globe.current.rotation.x += inertia.current.y;

              inertia.current.x *= FRICTION;
              inertia.current.y *= FRICTION;
            }

            renderer.current.render(scene.current, camera.current);
          };
          animate();
        }
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }, [selectedCountry]);

  useEffect(() => {
    if (geoJsonCountries.length > 0 && countriesData.length > 0) {
      mapCountriesToGlobe(geoJsonCountries);
    }
  }, [geoJsonCountries, countriesData]);

  const mapCountriesToGlobe = (features) => {
    features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      let countryName = feature.properties.admin.trim().toLowerCase();

      // Check if this country exists in the database (visited countries)
      const country = countriesData.find(
        (c) => c.name.trim().toLowerCase() === countryName
      );

      const countryColor = country && country.visited ? 0x00ff00 : 0xff0000; // Green for visited, Red for non-visited

      const countryGroup = new THREE.Group();

      if (feature.geometry.type === "Polygon") {
        mapPolygonToGlobe(
          coordinates,
          countryGroup,
          countryColor,
          country,
          feature
        );
      } else if (feature.geometry.type === "MultiPolygon") {
        coordinates.forEach((polygon) => {
          mapPolygonToGlobe(
            polygon,
            countryGroup,
            countryColor,
            country,
            feature
          );
        });
      }

      globe.current.add(countryGroup);
    });
  };

  const mapPolygonToGlobe = (
    polygon,
    countryGroup,
    countryColor,
    country,
    feature
  ) => {
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

      // If country is null, set default non-visited country data
      line.userData = {
        isCountry: true,
        countryData: country || {
          name: feature.properties.admin,
          visited: false,
        },
      };

      countryGroup.add(line);
    });
  };

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (!camera.current || !!selectedCountry) return; // Disable if modal is open

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
          clickedCountry.current = clickedObject.userData.countryData;
        } else {
          clickedCountry.current = null;
        }
      } else {
        clickedCountry.current = null;
      }
    };

    const handleMouseMove = (event) => {
      if (
        !clickStart.current ||
        !globe.current ||
        !isMouseDown.current ||
        !!selectedCountry
      )
        return; // Disable if modal is open

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
      if (!camera.current || !!selectedCountry) return; // Disable if modal is open

      if (!isDragging.current && clickedCountry.current) {
        const foundCountry = countriesData.find(
          (c) =>
            c.name.trim().toLowerCase() ===
            clickedCountry.current.name.trim().toLowerCase()
        );

        if (foundCountry) {
          setSelectedCountry(foundCountry);
        } else {
          setSelectedCountry({
            name: clickedCountry.current.name,
            visited: false,
            cities: [],
            recommendations: "No recommendations available",
            highlights: "No highlights available",
            dislikes: "No dislikes available",
          });
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

    // Add event listeners only once
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [countriesData, selectedCountry]); // Include dependencies that affect the event listeners

  return (
    <div>
      <div ref={globeRef} />
      <CountryModal
        isOpen={!!selectedCountry}
        countryData={selectedCountry}
        onClose={() => setSelectedCountry(null)}
        setCountriesData={setCountriesData} // Pass this to allow modal to update the data
        countriesData={countriesData} // Pass this to allow data access in the modal
        setSelectedCountry={setSelectedCountry} // Pass setSelectedCountry to modal
      />
    </div>
  );
};

export default Globe;
