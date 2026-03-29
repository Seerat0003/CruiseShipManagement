import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setLoggedIn }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed - ${name}:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const { email, password } = formData;

    if (!email || !password) {
      setErrorMsg('Please fill in both email and password fields.');
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccessMsg(`Welcome back, ${data.user.name}! Authenticating...`);
        setLoggedIn(true);
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/voyager/dashboard');
          }
        }, 1500);
      } else {
        setErrorMsg(data.message || "Invalid credentials provided.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network server error. Please verify backend is running.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-form-title">Login</h2>
      {errorMsg && <div style={{padding: '12px', background: 'rgba(255, 80, 80, 0.1)', border: '1px solid #ff5050', color: '#ff5050', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', width: '100%', maxWidth: '350px', margin: '0 auto 1.5rem auto'}}>{errorMsg}</div>}
      {successMsg && <div style={{padding: '12px', background: 'rgba(81, 207, 102, 0.1)', border: '1px solid #51cf66', color: '#51cf66', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', width: '100%', maxWidth: '350px', margin: '0 auto 1.5rem auto'}}>{successMsg}</div>}

      <form className="login-form" onSubmit={handleSubmit}>

        <input
          type="email"
          name="email"
          placeholder="Email address"
          className="login-input"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="login-input"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button className="login-submit" type="submit">Login</button>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don’t have an account? <Link to="/admin/signup">Create One</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
