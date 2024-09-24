import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import CityModal from "./CityModal"; // Import CityModal component
import "./CountryModal.css";

const CountryModal = ({ isOpen, countryData, onClose }) => {
  const [cities, setCities] = useState([]); // Ensure cities is initialized as an array
  const [newCityName, setNewCityName] = useState(""); // For adding new city
  const [selectedCity, setSelectedCity] = useState(null); // State for selected city modal
  const [showCityModal, setShowCityModal] = useState(false); // State to show CityModal

  useEffect(() => {
    if (countryData) {
      // Ensure cities is always set as an array
      setCities(Array.isArray(countryData.cities) ? countryData.cities : []);
    }
  }, [countryData]);

  // Handle adding a new city and saving it to the backend
  const handleAddCity = () => {
    console.log(countryData);
    if (newCityName.trim() !== "" && countryData?.id) {
      // Ensure countryData.id exists
      fetch(`http://localhost:3000/countries/${countryData.id}/cities`, {
        // Use the correct country ID
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: { name: newCityName }, // Send the city name to the backend
        }),
      })
        .then((response) => response.json())
        .then((newCity) => {
          // Update the local state with the newly created city from the backend
          setCities([...cities, newCity]);
          setNewCityName(""); // Clear the input field after adding the city
          setNewCityName(""); // Clear the input field after adding the city

          // Notify the parent component to refresh city markers
          if (countryData.onCityAdded) {
            countryData.onCityAdded(newCity); // Call the function passed from the parent
          }
        })
        .catch((error) => {
          console.error("Error adding city:", error);
        });
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
        <h2>{countryData.name || "No country selected"}</h2>

        {/* List of Cities */}
        {cities.length > 0 ? (
          cities.map((city, index) => (
            <div
              key={city.id || index} // Ensure a unique key, fallback to index if no id
              className="city-card"
              onClick={() => handleCityClick(city)}
            >
              <div className="city-details">
                <h3 className="clickable-city">{city.name}</h3>
                <p>Click to edit details</p>
              </div>
            </div>
          ))
        ) : (
          <p>No cities added yet</p>
        )}

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
