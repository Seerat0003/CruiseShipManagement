import React, { useState } from "react";
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';
import './VoyagerRegistration.css';
import { REGISTER_MUTATION, ADMIN_DASHBOARD_QUERY } from "../graphql/operations";

const VoyagerRegistration = () => {
  const [registerVoyager] = useMutation(REGISTER_MUTATION);
  
  const { data, loading: loadingVoyagers, refetch } = useQuery(ADMIN_DASHBOARD_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const voyagers = data?.voyagers ?? [];
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

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
        },
      });

      toast.success("Voyager profile successfully created!");
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to register voyager.");
    } finally {
      setLoading(false);
    }
  };

  const filteredVoyagers = voyagers.filter((v) => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone?.includes(searchTerm)
  );

  return (
    <div className="voyager-registry-container voyager-page-shell">
      <div className="registry-header-row">
        <div className="registry-title-block">
          <h2 className="voyager-title">Voyager Registry</h2>
          <p className="voyager-subtitle">
            Administer passenger credentials, monitor active voyage profiles, and enroll new voyagers.
          </p>
        </div>
        <button 
          className="btn-luxury register-toggle-btn" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "✕ Close Registration Form" : "➕ Enroll New Passenger"}
        </button>
      </div>

      <div className="registry-body-grid">
        <div className={`registry-main-panel ${showAddForm ? 'split-view' : 'full-view'}`}>
          <div className="search-bar-wrap">
            <input 
              type="text" 
              placeholder="🔍 Search passengers by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>

          {loadingVoyagers && !data ? (
            <div className="registry-loading-state">
              <span className="spinner"></span> Loading registered voyagers...
            </div>
          ) : (
            <div className="table-wrap">
              <table className="registry-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoyagers.length > 0 ? (
                    filteredVoyagers.map((v) => (
                      <tr key={v.id} className="registry-data-row">
                        <td className="id-cell">V-{v.id * 832}</td>
                        <td className="name-cell">{v.name}</td>
                        <td className="email-cell">{v.email}</td>
                        <td>{v.phone || '—'}</td>
                        <td>
                          {v.createdAt 
                            ? (Number.isNaN(Number(v.createdAt)) 
                               ? new Date(v.createdAt).toLocaleDateString()
                               : new Date(Number(v.createdAt)).toLocaleDateString())
                            : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-cell">
                        No registered passengers matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAddForm && (
          <div className="registry-form-panel">
            <div className="voyager-card">
              <h3 className="form-card-title">Enroll New Voyager</h3>
              <p className="form-card-subtitle">Complete details below to generate a new credentials account.</p>
              <form onSubmit={handleSubmit} className="voyager-form">
                <div className="voyager-field">
                  <label className="voyager-label" htmlFor="voyager-username">Username / Full Name</label>
                  <input
                    id="voyager-username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Eleanor Vance"
                    className="voyager-input"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div className="voyager-field">
                  <label className="voyager-label" htmlFor="voyager-email">Email Address</label>
                  <input
                    id="voyager-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="eleanor.vance@luxury.com"
                    className="voyager-input"
                    disabled={loading}
                  />
                </div>

                <div className="voyager-field">
                  <label className="voyager-label" htmlFor="voyager-phone">Phone Number</label>
                  <input
                    id="voyager-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="^\d{10}$"
                    title="Enter a 10-digit phone number"
                    placeholder="e.g. 9876543210"
                    className="voyager-input"
                    disabled={loading}
                  />
                </div>

                <div className="voyager-field">
                  <label className="voyager-label" htmlFor="voyager-password">Account Password</label>
                  <input
                    id="voyager-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="voyager-input"
                    disabled={loading}
                  />
                </div>

                <div className="voyager-field">
                  <label className="voyager-label" htmlFor="voyager-confirm-password">Confirm Password</label>
                  <input
                    id="voyager-confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="voyager-input"
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="voyager-button" disabled={loading}>
                  {loading ? "Registering Account..." : "Create Account"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoyagerRegistration;
