import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import './SignUp.css';
import { REGISTER_MUTATION } from '../graphql/operations';

function SignUpForm({ setLoggedIn }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed - ${name}:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      const { data } = await registerMutation({
        variables: {
          name: formData.name, 
          email: formData.email, 
          password: formData.password,
          role: "voyager",
        },
      });

      if (data?.register?.user) {
        setLoggedIn(false);
        setSuccessMsg(data.register.message || "Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setErrorMsg("Registration failed. Please verify credentials.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Network error. The Backend Server is not reachable.");
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-form-title">Create Account</h2>
      
      {errorMsg && <div style={{padding: '12px', background: 'rgba(255, 80, 80, 0.1)', border: '1px solid #ff5050', color: '#ff5050', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', width: '100%', maxWidth: '350px', margin: '0 auto 1.5rem auto'}}>{errorMsg}</div>}
      {successMsg && <div style={{padding: '12px', background: 'rgba(81, 207, 102, 0.1)', border: '1px solid #51cf66', color: '#51cf66', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', width: '100%', maxWidth: '350px', margin: '0 auto 1.5rem auto'}}>{successMsg}</div>}

      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          className="signup-input"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email address"
          className="signup-input"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="signup-input"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          className="signup-input"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button className="signup-submit" type="submit">Sign Up</button>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/admin/login">Log In</Link>
        </p>
      </form>
    </div>
  );
}

export default SignUpForm;
