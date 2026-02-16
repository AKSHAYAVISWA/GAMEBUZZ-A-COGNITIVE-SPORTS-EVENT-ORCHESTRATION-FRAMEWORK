import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // NOTE: The alert() function is typically replaced with a custom message box in production environments.
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, role, userId } = res.data;

      // NOTE: Using localStorage for token is common for example apps, but not secure for production.
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      alert(`Login successful as ${role}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  // --- Inline Styles for Background/Container (Kept for full-screen appearance) ---

  const backgroundContainerStyle = {
    backgroundImage: `url('/images/601790.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    minHeight: '100vh',
    backgroundAttachment: 'fixed', 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', 
    margin: 0,
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  }

  const formWrapperStyle = {
    position: 'relative',
    zIndex: 2,
    maxWidth: '600px',
    width: '100%',
    // Adjusted margin to prevent overlap with a fixed navigation bar
    marginTop: '100px', 
    padding: '1.5rem', 
  }

  const registerLinkStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#00d4ff', // Matches the primary theme color
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.3s ease',
    textShadow: '0 0 5px rgba(0, 212, 255, 0.3)',
    fontSize: '1.1rem',
  };

  // ---------------------------------------------

  return (
    <div style={backgroundContainerStyle}>
      {/* Dark overlay for better form readability */}
      <div style={overlayStyle} />

      <div style={formWrapperStyle}>
        
        {/* Updated Heading to include the website name "Gamebuzz" */}
        <h2>Gamebuzz Login</h2> 

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>

        {/* Link to Registration Page */}
        <p 
          onClick={() => navigate('/register')} 
          style={registerLinkStyle}
        >
          Don't have an account? Register here.
        </p>
      </div>
    </div>
  );
}

export default Login;
