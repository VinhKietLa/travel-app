import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import CityModal from "./CityModal"; // Import CityModal component
import "./CountryModal.css";

const CountryModal = ({ isOpen, countryData, onClose }) => {
  const [cities, setCities] = useState([]);
  const [newCityName, setNewCityName] = useState(""); // For adding new city
  const [selectedCity, setSelectedCity] = useState(null); // State for selected city modal
  const [showCityModal, setShowCityModal] = useState(false); // State to show CityModal

  useEffect(() => {
    // You can initialize cities based on countryData if needed
    if (countryData) {
      // Example: You can set default cities for each country if necessary
      // setCities(initialCitiesForCountry[countryData.name] || []);
    }
  }, [countryData]);

  // Handle adding a new city
  const handleAddCity = () => {
    if (newCityName.trim() !== "") {
      // Create a new city object
      const newCity = {
        id: Date.now(), // Simple ID generation
        name: newCityName,
        recommendations: "",
        highlights: "",
        dislikes: "",
      };

      // Add the new city to the local state
      setCities([...cities, newCity]);
      setNewCityName(""); // Clear the input field after adding the city
    }
  };

  // Handle removing a city
  const handleDeleteCity = (cityId) => {
    const updatedCities = cities.filter((city) => city.id !== cityId);
    setCities(updatedCities); // Update the state with the new list of cities
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
    setCities(updatedCities); // Update the state with the new city data
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
        {/* Access the 'name' property of the passed countryData */}
        <h2>{countryData.name || "No country selected"}</h2>

        {/* List of Cities */}
        {cities.map((city) => (
          <div
            key={city.id}
            className="city-card"
            onClick={() => handleCityClick(city)}
          >
            <div className="city-details">
              <h3 className="clickable-city">{city.name}</h3>
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
          onDelete={handleDeleteCity} // Handle delete city
        />
      )}
    </Modal>
  );
};

export default CountryModal;
