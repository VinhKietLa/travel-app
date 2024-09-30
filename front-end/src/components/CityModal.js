import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import "./CityModal.css"; // Optional: Add your own styles
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick"; // Import Slider from react-slick

const CityModal = ({ isOpen, cityData, onClose, onSave, onDelete }) => {
  const [name, setName] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [highlights, setHighlights] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && cityData) {
      axios
        .get(
          `http://localhost:3000/countries/${cityData.country_id}/cities/${cityData.id}`
        )
        .then((response) => {
          const updatedCity = response.data;
          setName(updatedCity.name || "");
          setRecommendations(updatedCity.recommendations || "");
          setHighlights(updatedCity.highlights || "");
          setDislikes(updatedCity.dislikes || "");
          setNotes(updatedCity.notes || "");
          setUploadedImages(updatedCity.images_urls || []);
        })
        .catch((error) => {
          console.error("Error fetching city data:", error);
        });
    }
  }, [isOpen, cityData]);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleFileUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("city[images][]", selectedFiles[i]);
    }

    try {
      const response = await fetch(
        `http://localhost:3000/countries/${cityData.country_id}/cities/${cityData.id}`,
        {
          method: "PATCH",
          body: formData,
          credentials: "include", // Ensure cookies are sent with the request
        }
      );
      const updatedCity = await response.json();

      setUploadedImages((prevImages) => [
        ...prevImages,
        ...updatedCity.images_urls,
      ]);

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const updatedCityData = {
      ...cityData,
      name,
      recommendations,
      highlights,
      dislikes,
      notes,
    };

    axios
      .put(
        `http://localhost:3000/countries/${cityData.country_id}/cities/${cityData.id}`,
        updatedCityData,
        { withCredentials: true }
      )
      .then((response) => {
        onSave(response.data);
        onClose();
      })
      .catch((error) => {
        console.error("Error updating city information:", error);
      });

    onSave(updatedCityData);
    onClose();
  };

  const handleDelete = () => {
    onDelete(cityData.id);
    onClose();
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  if (!cityData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="City Details"
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
      <div className="city-modal-container">
        <h2>{name}</h2>

        <div className="form-group">
          <label>City Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="edit-city-name-input"
          />
        </div>

        <div className="form-group">
          <label>Recommendations:</label>
          <textarea
            className="city-textarea-input"
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            placeholder="Specific places, things to do, or tips."
          />
        </div>

        <div className="form-group">
          <label>Highlights:</label>
          <textarea
            className="city-textarea-input"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            placeholder="Personal favorite moments, experiences, or memories."
          />
        </div>

        <div className="form-group">
          <label>Dislikes:</label>
          <textarea
            className="city-textarea-input"
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
            placeholder="Places to avoid, things to skip, or tips to avoid."
          />
        </div>
        <div className="form-group">
          <label>Notes:</label>
          <textarea
            className="city-textarea-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or thoughts about the city."
          />
        </div>

        <div className="form-group">
          <label>Upload Images:</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <button
            className="upload-button"
            onClick={handleFileUpload}
            disabled={selectedFiles.length === 0 || loading}
          >
            {loading ? "Uploading..." : "Upload Images"}
          </button>
        </div>

        {uploadedImages.length > 0 ? (
          <Slider {...settings}>
            {uploadedImages.map((url, index) => (
              <div key={index} className="image-container">
                <img
                  src={`http://localhost:3000${url}`}
                  alt={`City ${index}`}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "contain",
                    marginBottom: "10px",
                  }}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <p>No images available.</p>
        )}

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
