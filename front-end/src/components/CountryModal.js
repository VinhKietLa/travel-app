import React from "react";
import Modal from "react-modal";
import axios from "axios";

const CountryModal = ({
  isOpen,
  countryData,
  onClose,
  setCountriesData,
  countriesData,
  setSelectedCountry, // Ensure setSelectedCountry is received as a prop
}) => {
  if (!countryData) return null; // Don't render the modal if no country is selected

  const {
    name,
    cities = [],
    recommendations = "",
    highlights = "",
    dislikes = "",
  } = countryData;

  console.log("Country data in modal:", countryData);

  // Function to save a new country in the database
  const saveNewCountry = (country) => {
    axios
      .post("http://localhost:3000/countries", {
        name: country.name,
        visited: true, // Mark it as visited
      })
      .then((response) => {
        const createdCountry = response.data;

        // Update countriesData with the newly created country
        setCountriesData([...countriesData, createdCountry]);

        // Update the modal with the newly created country's details (with ID)
        setSelectedCountry(createdCountry);
      })
      .catch((error) => {
        console.error("Error creating country:", error);
      });
  };

  // Function to toggle the visited status of a country
  const toggleCountryVisitStatus = (country) => {
    if (!country.id) {
      // If no ID exists, it means the country is not yet in the database, so create a new record
      saveNewCountry(country);
    } else {
      const updatedStatus = !country.visited; // Toggle the visited status

      axios
        .put(`http://localhost:3000/countries/${country.id}`, {
          visited: updatedStatus,
        })
        .then((response) => {
          const updatedCountry = response.data;

          // Update the countriesData and modal content with the updated country data
          setCountriesData((prevData) =>
            prevData.map((c) =>
              c.id === updatedCountry.id ? updatedCountry : c
            )
          );

          setSelectedCountry(updatedCountry);
        })
        .catch((error) => {
          console.error("Error updating country status:", error);
        });
    }
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
