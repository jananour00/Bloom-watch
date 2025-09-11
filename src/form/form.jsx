// BloomWatchForm.jsx
import React, { useState } from 'react';
import './form.css';

export default function BloomWatchForm() {
  const [formData, setFormData] = useState({
    username: '',
    bloomStage: 'Flowering',
    location: '',
    date: ''
  });
  //for future functionality

//   const [isOpen, setIsOpen] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

//   if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="header">
          <div className="icon-container">
            📊
          </div>
          <h2 className="title">
            Be Part of BloomWatch!
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="close-button"
          >
            ×
          </button>
        </div>

        <p className="description">
          Report blooms, track your impact, and climb the leaderboard.
        </p>

        {/* Name/Username Field */}
        <div className="field-container">
          <label className="field-label">
            Name / Username
            <span className="info-icon">ⓘ</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="e.g. mohammed00"
            className="text-input"
          />
        </div>

        {/* Bloom Stage Field */}
        <div className="field-container">
          <label className="field-label">
            Bloom Stage
            <span className="info-icon">ⓘ</span>
          </label>
          <select
            name="bloomStage"
            value={formData.bloomStage}
            onChange={handleInputChange}
            className="select-input"
          >
            <option value="Flowering">Flowering</option>
            <option value="Budding">Budding</option>
            <option value="Blooming">Blooming</option>
            <option value="Wilting">Wilting</option>
          </select>
        </div>

        {/* Upload Image Field */}
        <div className="field-container">
          <label className="field-label-block">
            Upload the Image
          </label>
          <div className="file-upload-container">
            <span className="file-placeholder">
              No file selected
            </span>
            <button type="button" className="browse-button">
              Browse
            </button>
          </div>
        </div>

        {/* Location and Date Fields */}
        <div className="fields-row">
          <div className="field-half">
            <label className="field-label-block">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Math Building, Room 301"
              className="text-input"
            />
          </div>
          <div className="field-half">
            <label className="field-label-block">
              Date
            </label>
            <div className="date-input-container">
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                placeholder="mm/dd/yyyy"
                className="text-input date-input"
              />
              <span className="calendar-icon">📅</span>
            </div>
          </div>
        </div>

        {/* Submit and Close Buttons */}
        <div className="button-container">
          <button
            onClick={handleSubmit}
            className="submit-button"
          >
            Submit
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="close-form-button"
          >
            Close
          </button>
        </div>

        {/* Bottom Text */}
        <div className="bottom-section">
          <h3 className="bottom-title">
            Your Bloom Makes a Difference!
          </h3>
        </div>
      </div>
    </div>
  );
}
