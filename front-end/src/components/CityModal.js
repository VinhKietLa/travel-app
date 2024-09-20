import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./CityModal.css"; // Optional: Add your own styles
import axios from "axios";
const CityModal = ({ isOpen, cityData, onClose, onSave, onDelete }) => {
  const [name, setName] = useState(""); // New state for the city name
  const [recommendations, setRecommendations] = useState("");
  const [highlights, setHighlights] = useState("");
  const [dislikes, setDislikes] = useState("");

  useEffect(() => {
    if (cityData) {
      setName(cityData.name || ""); // Set city name for editing
      setRecommendations(cityData.recommendations || "");
      setHighlights(cityData.highlights || "");
      setDislikes(cityData.dislikes || "");
    }
  }, [cityData]);

  const handleSave = () => {
    const updatedCityData = {
      ...cityData,
      name, // Updated city name
      recommendations,
      highlights,
      dislikes,
    };

    // Send the updated city data to the backend
    axios
      .put(
        `http://localhost:3000/countries/${cityData.country_id}/cities/${cityData.id}`,
        updatedCityData
      ) // Ensure the correct country and city IDs are used
      .then((response) => {
        onSave(response.data); // Update the city data in the parent component (CountryModal)
        onClose(); // Close the modal after saving
      })
      .catch((error) => {
        console.error("Error updating city information:", error);
      });

    onSave(updatedCityData); // Save changes
    onClose();
  };

  const handleDelete = () => {
    onDelete(cityData.id); // Call the delete function from parent component
    onClose();
  };

  if (!cityData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="City Details"
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
    >
      <div className="modal-container">
        <h2>City: {name}</h2>

        <div className="form-group">
          <label>City Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)} // Input field for editing name
          />
        </div>

        <div className="form-group">
          <label>Recommendations:</label>
          <textarea
            className="textarea-input"
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Highlights:</label>
          <textarea
            className="textarea-input"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Dislikes:</label>
          <textarea
            className="textarea-input"
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
          />
        </div>

        <div className="button-group">
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Delete City
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CityModal;
