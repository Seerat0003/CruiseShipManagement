import React, { useState } from "react";
import './VoyagerRegistration.css';
import { useNavigate } from "react-router-dom";

const VoyagerRegistration = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed - ${name}:`, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting voyager registration with data:", formData);

    try {
      console.log("Registration submitted locally.", formData);
      alert(`Voyager '${formData.username}' registered locally only. Persistence is not wired.`);
      setFormData({ username: "", email: "", phone: "" });
      navigate("/");
    } finally {
      setLoading(false);
      console.log("Registration process finished.");
    }
  };

  return (
    <div className="voyager-container">
      <h2 className="voyager-title">Voyager Registration</h2>
      <form onSubmit={handleSubmit} className="voyager-form">
        <div className="voyager-field">
          <label className="voyager-label">Username</label><br />
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="voyager-input"
            autoFocus
            disabled={loading}
          />
        </div>

        <div className="voyager-field">
          <label className="voyager-label">Email</label><br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="voyager-input"
            disabled={loading}
          />
        </div>

        <div className="voyager-field">
          <label className="voyager-label">Phone</label><br />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="^\d{10}$"
            title="Enter a 10-digit phone number"
            className="voyager-input"
            disabled={loading}
          />
        </div>

        <button type="submit" className="voyager-button" disabled={loading}>
          {loading ? "Registering..." : "Register Voyager"}
        </button>
      </form>
    </div>
  );
};

export default VoyagerRegistration;
