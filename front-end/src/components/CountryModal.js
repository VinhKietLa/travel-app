import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import CityModal from "./CityModal";
import "./CountryModal.css";

const CountryModal = ({
  isOpen,
  countryData,
  onClose,
  // onCountryStatusUpdate,
  onCityDeleted,
  onCityAdded,
  onNextLocation,
  isAuthenticated,
  csrfToken,
}) => {
  const [cities, setCities] = useState([]); // Ensure cities is initialized as an array
  const [newCityName, setNewCityName] = useState(""); // For adding new city
  const [selectedCity, setSelectedCity] = useState(null); // State for selected city modal
  const [showCityModal, setShowCityModal] = useState(false); // State to show CityModal
  const [localCountryData, setLocalCountryData] = useState(countryData);

  useEffect(() => {
    if (countryData) {
      // Ensure cities is always set as an array
      setCities(Array.isArray(countryData.cities) ? countryData.cities : []);
      setLocalCountryData(countryData);
    }
  }, [countryData]);

  // Handle adding a new city and saving it to the backend
  const handleAddCity = () => {
    const token = localStorage.getItem("token");

    if (!isAuthenticated) {
      alert("You must be logged in to add a city.");
      return;
    }
    if (isAuthenticated && newCityName.trim() !== "" && localCountryData?.id) {
      fetch(`http://localhost:3000/countries/${localCountryData.id}/cities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the JWT token in Authorization header
        },
        credentials: "include", // Ensure cookies are sent with the request
        body: JSON.stringify({
          city: { name: newCityName },
        }),
      })
        .then((response) => response.json())
        .then((newCity) => {
          setCities([...cities, newCity]);
          setNewCityName(""); // Clear the input field

          // Fetch the updated country data after adding the new city
          fetch(`http://localhost:3000/countries/${localCountryData.id}`, {
            credentials: "include", // Include session cookies
          })
            .then((response) => response.json())
            .then((updatedCountry) => {
              // Notify parent of the updated country data, including the new city
              if (onCityAdded) {
                onCityAdded(newCity, updatedCountry); // Pass the updated country data
              }
            })
            .catch((error) =>
              console.error("Error fetching updated country:", error)
            );
        })
        .catch((error) => console.error("Error adding city:", error));
    }
  };

  // Handle removing a city
  const handleDeleteCity = (cityId) => {
    const token = localStorage.getItem("token");
    fetch(
      `http://localhost:3000/countries/${countryData.id}/cities/${cityId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the JWT token in Authorization header
        },
        credentials: "include", // Ensure cookies are sent with the request
      }
    )
      .then(() => {
        const updatedCities = cities.filter((city) => city.id !== cityId);
        setCities(updatedCities); // Update the local state

        // If no cities left, notify parent to update country status
        if (updatedCities.length === 0) {
          onCityDeleted(countryData.id);
        }
      })
      .catch((error) => console.error("Error deleting city:", error));
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

  const handleNextLocation = () => {
    // Use the functional update form to ensure we're working with the latest state
    setLocalCountryData((prevData) => {
      const newStatus = !prevData.future_travel; // Toggle based on the previous state

      if (onNextLocation) {
        onNextLocation(prevData.id, newStatus); // Notify the parent with the new status
      }

      // Return the updated data with the toggled future_travel status
      return { ...prevData, future_travel: newStatus };
    });
  };

  // Fetch and update country status
  // const updateCountryStatus = () => {
  //   fetch(`http://localhost:3000/countries/${countryData.id}`)
  //     .then((response) => response.json())
  //     .then((updatedCountry) => {
  //       // Call parent method to update country status in the globe
  //       if (onCountryStatusUpdate) {
  //         onCountryStatusUpdate(updatedCountry);
  //       }
  //       setCities(updatedCountry.cities); // Ensure cities are updated too if necessary
  //       countryData.future_travel = updatedCountry.future_travel; // Update the local state for the country modal (so it re-renders with updated data)
  //       setLocalCountryData(updatedCountry); // Update local country data to ensure the UI reflects the changes
  //     })
  //     .catch((error) => {
  //       console.error("Error updating country status:", error);
  //     });
  // };

  if (!countryData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Country Details"
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
      style={{
        content: {
          backgroundColor: "#2C2C2E",
        },
        overlay: {
          backgroundColor: "transparent",
        },
      }}
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
            className="add-city-input"
          />
          <button className="add-button" onClick={handleAddCity}>
            Add City
          </button>
        </div>

        <div className="button-group">
          <button className="toggle-button" onClick={handleNextLocation}>
            {localCountryData?.future_travel
              ? "Unmark as next location"
              : "Mark as next location"}
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
          onDelete={handleDeleteCity} // Handle delete city
        />
      )}
    </Modal>
  );
};

export default CountryModal;
