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
      // Create a new city object
      const newCity = {
        name: newCityName,
        recommendations: "",
        highlights: "",
        dislikes: "",
        country_id: countryData.id, // Associate the new city with the correct country
      };

      // Send POST request to save the new city immediately to the backend
      axios
        .post(
          `http://localhost:3000/countries/${countryData.id}/cities`,
          newCity
        )
        .then((response) => {
          // Add the newly saved city to the local state after receiving the response
          setCities([...cities, response.data]);
          setNewCityName(""); // Clear the input field after adding the city
        })
        .catch((error) => {
          console.error("Error adding new city:", error);
        });
    }
  };

  // Handle removing a city
  const handleDeleteCity = (cityId, countryId) => {
    // Filter out the city with the given ID
    const updatedCities = cities.filter((city) => city.id !== cityId);
    setCities(updatedCities); // Update the state with the new list of cities

    // Optionally, you can send a DELETE request to the backend to delete the city from the database
    axios
      .delete(`http://localhost:3000/countries/${countryId}/cities/${cityId}`) // Include countryId in the URL
      .then(() => {
        console.log(`City with ID ${cityId} deleted successfully.`);
      })
      .catch((error) => {
        console.error("Error deleting city:", error);
      });
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
    // Map through the cities and update the city with the new data
    const updatedCities = cities.map((city) =>
      city.id === updatedCity.id ? updatedCity : city
    );
    setCities(updatedCities); // Update the state with the new city data
  };

  // const handleSaveChanges = () => {
  //   const updatedCountryData = {
  //     id: countryData.id, // Make sure the country ID is sent
  //     visited: countryData.visited, // Keep the current visited status
  //     cities_attributes: cities.map((city) => ({
  //       id: city.id,
  //       name: city.name,
  //       recommendations: city.recommendations,
  //       highlights: city.highlights,
  //       dislikes: city.dislikes,
  //     })),
  //   };

  //   axios
  //     .put(
  //       `http://localhost:3000/countries/${countryData.id}`, // Ensure the correct country ID is used in the URL
  //       updatedCountryData
  //     )
  //     .then((response) => {
  //       const updatedCountry = response.data;
  //       setCountriesData(
  //         countriesData.map((c) =>
  //           c.id === updatedCountry.id ? updatedCountry : c
  //         )
  //       );
  //       onClose();
  //     })
  //     .catch((error) => {
  //       console.error("Error updating country information:", error);
  //     });
  // };

  // Retained toggleCountryVisitStatus function
  const toggleCountryVisitStatus = (country) => {
    console.log("Country clicked:", country); // Log the entire country object
    console.log("Country ID:", country.id); // Log the ID of the country clicked

    const updatedStatus = !country.visited;

    // Check if the country exists in the backend by trying to fetch it
    axios
      .get(`http://localhost:3000/countries/${country.id}`)
      .then(() => {
        // If the country exists in the backend, update it
        axios
          .put(`http://localhost:3000/countries/${country.id}`, {
            id: country.id,
            visited: updatedStatus,
          })
          .then((response) => {
            const updatedCountry = response.data;
            setCountriesData(
              countriesData.map((c) =>
                c.id === updatedCountry.id ? updatedCountry : c
              )
            );
            setSelectedCountry(updatedCountry); // Ensure the correct country is selected
            console.log("Updated country:", updatedCountry); // Log updated country
          })
          .catch((error) => {
            console.error("Error updating country status:", error);
          });
      })
      .catch(() => {
        // If the country doesn't exist in the backend, create it
        axios
          .post(`http://localhost:3000/countries`, {
            name: country.name,
            visited: updatedStatus,
          })
          .then((response) => {
            const newCountry = response.data;
            setCountriesData([...countriesData, newCountry]); // Add the newly created country to the list
            setSelectedCountry(newCountry); // Select the newly created country
            console.log("Created new country:", newCountry); // Log newly created country
          })
          .catch((error) => {
            console.error("Error creating new country:", error);
          });
      });
  };

  const toggleFutureTravel = (country) => {
    const updatedFutureTravel = !country.future_travel; // Toggle the future_travel status

    axios
      .put(`http://localhost:3000/countries/${country.id}`, {
        id: country.id,
        future_travel: updatedFutureTravel,
      })
      .then((response) => {
        const updatedCountry = response.data;
        setCountriesData(
          countriesData.map((c) =>
            c.id === updatedCountry.id ? updatedCountry : c
          )
        );
        setSelectedCountry(updatedCountry); // Update the modal to reflect the new state
      })
      .catch((error) => {
        console.error("Error updating future travel status:", error);
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
          {/* <button className="save-button" onClick={handleSaveChanges}>
            Save Changes
          </button> */}
          <button
            className="toggle-button"
            onClick={() => toggleCountryVisitStatus(countryData)}
          >
            {countryData.visited ? "Mark as Non-Visited" : "Mark as Visited"}
          </button>
          <button
            className="next-destination-button"
            onClick={() => toggleFutureTravel(countryData)}
          >
            {countryData.future_travel
              ? "Unmark as Next Destination"
              : "Mark as Next Destination"}
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
          onDelete={(cityId) => handleDeleteCity(cityId)}
        />
      )}
    </Modal>
  );
};

export default CountryModal;
