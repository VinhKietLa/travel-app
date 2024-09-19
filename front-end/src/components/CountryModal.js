import React from "react";
import Modal from "react-modal";
import axios from "axios";

const CountryModal = ({
  isOpen,
  countryData,
  onClose,
  setCountriesData,
  countriesData,
}) => {
  if (!countryData) return null; // Don't render the modal if no country is selected

  const {
    name,
    cities = [],
    recommendations = "",
    highlights = "",
    dislikes = "",
  } = countryData;

  // Function to toggle the visited status of a country
  const toggleCountryVisitStatus = (country) => {
    const updatedStatus = !country.visited; // Toggle the visited status

    axios
      .put(`http://localhost:3000/countries/${country.id}`, {
        visited: updatedStatus,
      })
      .then((response) => {
        const updatedCountry = response.data;

        // Update the countriesData with the updated country data
        setCountriesData(
          countriesData.map((c) =>
            c.id === updatedCountry.id ? updatedCountry : c
          )
        );
      })
      .catch((error) => {
        console.error("Error updating country status:", error);
      });
  };

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
      <button onClick={() => toggleCountryVisitStatus(countryData)}>
        {countryData.visited ? "Mark as Non-Visited" : "Mark as Visited"}
      </button>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default CountryModal;
