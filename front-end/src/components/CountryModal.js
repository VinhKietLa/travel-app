import React from "react";
import Modal from "react-modal";

const CountryModal = ({ isOpen, countryData, onClose }) => {
  if (!countryData) return null; // Don't render the modal if no country is selected

  const {
    name,
    cities = [],
    recommendations = "",
    highlights = "",
    dislikes = "",
  } = countryData;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Country Details"
      ariaHideApp={false} // This can prevent further modal issues for now
    >
      <h2>{name || "No country selected"}</h2>
      <p>
        Cities Visited:{" "}
        {cities.length > 0
          ? cities.map((city) => city.name).join(", ")
          : "No cities visited"}
      </p>
      <p>
        Recommendations: {recommendations || "No recommendations available"}
      </p>
      <p>Highlights: {highlights || "No highlights available"}</p>
      <p>Dislikes: {dislikes || "No dislikes available"}</p>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default CountryModal;
