import React, { useState } from "react";
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';
import './VoyagerRegistration.css';
import { useNavigate } from "react-router-dom";
import { REGISTER_MUTATION } from "../graphql/operations";

const VoyagerRegistration = () => {
  const [registerVoyager] = useMutation(REGISTER_MUTATION);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerVoyager({
        variables: {
          name: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "voyager",
        },
      });

      toast.success("Voyager saved to the database.");
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to register voyager.");
    } finally {
      setLoading(false);
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

        <div className="voyager-field">
          <label className="voyager-label">Password</label><br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="voyager-input"
            disabled={loading}
          />
        </div>

        <div className="voyager-field">
          <label className="voyager-label">Confirm Password</label><br />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
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
