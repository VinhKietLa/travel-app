import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./CityModal.css"; // Optional: Add your own styles

const CityModal = ({ isOpen, cityData, onClose, onSave }) => {
  const [recommendations, setRecommendations] = useState("");
  const [highlights, setHighlights] = useState("");
  const [dislikes, setDislikes] = useState("");

  useEffect(() => {
    if (cityData) {
      setRecommendations(cityData.recommendations || "");
      setHighlights(cityData.highlights || "");
      setDislikes(cityData.dislikes || "");
    }
  }, [cityData]);

  const handleSave = () => {
    const updatedCityData = {
      ...cityData,
      recommendations,
      highlights,
      dislikes,
    };

    onSave(updatedCityData); // Save changes to the city
    onClose(); // Close modal after saving
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
        <h2>City: {cityData.name}</h2>

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
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CityModal;
