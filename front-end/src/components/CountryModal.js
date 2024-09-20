import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import CityModal from "./CityModal"; // Import CityModal component
import "./CountryModal.css";

const CountryModal = ({
  isOpen,
  countryData,
  onClose,
  setCountriesData,
  countriesData,
  setSelectedCountry,
}) => {
  const [cities, setCities] = useState([]);
  const [newCityName, setNewCityName] = useState(""); // For adding new city
  const [selectedCity, setSelectedCity] = useState(null); // State for selected city modal
  const [showCityModal, setShowCityModal] = useState(false); // State to show CityModal

  useEffect(() => {
    if (countryData) {
      setCities(countryData.cities || []);
    }
  }, [countryData]);

  // Handle adding a new city
  const handleAddCity = () => {
    if (newCityName.trim() !== "") {
      setCities([
        ...cities,
        {
          id: null,
          name: newCityName,
          recommendations: "",
          highlights: "",
          dislikes: "",
        },
      ]);
      setNewCityName("");
    }
  };

  // Handle removing a city
  const handleRemoveCity = (index) => {
    const updatedCities = [...cities];
    updatedCities.splice(index, 1); // Remove city from list
    setCities(updatedCities);
  };

  // Open CityModal for editing city details
  const handleCityClick = (city) => {
    setSelectedCity(city);
    setShowCityModal(true); // Show City Modal when a city is clicked
  };

  const handleCityModalClose = () => {
    setSelectedCity(null);
    setShowCityModal(false); // Close City Modal
  };

  // Handle saving updated city data from CityModal
  const handleSaveCity = (updatedCity) => {
    const updatedCities = cities.map((city) =>
      city.id === updatedCity.id ? updatedCity : city
    );
    setCities(updatedCities);
  };

  const handleSaveChanges = () => {
    const updatedCountryData = {
      id: countryData.id, // Make sure the country ID is sent
      visited: countryData.visited, // Keep the current visited status
      cities_attributes: cities.map((city) => ({
        id: city.id,
        name: city.name,
        recommendations: city.recommendations,
        highlights: city.highlights,
        dislikes: city.dislikes,
      })),
    };

    axios
      .put(
        `http://localhost:3000/countries/${countryData.id}`, // Ensure the correct country ID is used in the URL
        updatedCountryData
      )
      .then((response) => {
        const updatedCountry = response.data;
        setCountriesData(
          countriesData.map((c) =>
            c.id === updatedCountry.id ? updatedCountry : c
          )
        );
        onClose();
      })
      .catch((error) => {
        console.error("Error updating country information:", error);
      });
  };

  // Retained toggleCountryVisitStatus function
  const toggleCountryVisitStatus = (country) => {
    const updatedStatus = !country.visited;
    console.log(country.id);
    axios
      .put(`http://localhost:3000/countries/${country.id}`, {
        id: country.id, // Include the ID in the payload
        visited: updatedStatus,
      })
      .then((response) => {
        const updatedCountry = response.data;
        setCountriesData(
          countriesData.map((c) =>
            c.id === updatedCountry.id ? updatedCountry : c
          )
        );
        setSelectedCountry(updatedCountry);
      })
      .catch((error) => {
        console.error("Error updating country status:", error);
      });
  };

  if (!countryData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Country Details"
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
    >
      <div className="modal-container">
        <h2>{countryData.name || "No country selected"}</h2>

        {/* List of Cities */}
        {cities.map((city, index) => (
          <div
            key={index}
            className="city-card"
            onClick={() => handleCityClick(city)}
          >
            <div className="city-image-placeholder">
              {/* Placeholder for stock image, you can add real images later */}
              <img
                src="/path-to-placeholder-image.jpg"
                alt="City Placeholder"
              />
            </div>
            <div className="city-details">
              <h3 className="clickable-city">City: {city.name}</h3>
              <p>Click to edit details</p>
            </div>
          </div>
        ))}

        {/* Form to Add New City */}
        <div className="add-city-section">
          <input
            type="text"
            placeholder="New City Name"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
          />
          <button className="add-button" onClick={handleAddCity}>
            Add City
          </button>
        </div>

        <div className="button-group">
          <button className="save-button" onClick={handleSaveChanges}>
            Save Changes
          </button>
          <button
            className="toggle-button"
            onClick={() => toggleCountryVisitStatus(countryData)}
          >
            {countryData.visited ? "Mark as Non-Visited" : "Mark as Visited"}
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* City Modal */}
      {showCityModal && selectedCity && (
        <CityModal
          isOpen={showCityModal}
          cityData={selectedCity} // Pass the correct prop name
          onClose={handleCityModalClose}
          onSave={handleSaveCity} // Handle save city data
        />
      )}
    </Modal>
  );
};

export default CountryModal;
