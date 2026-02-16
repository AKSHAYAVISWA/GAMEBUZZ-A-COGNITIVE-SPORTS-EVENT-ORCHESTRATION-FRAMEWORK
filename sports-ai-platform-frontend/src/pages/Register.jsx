import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// NOTE: The CustomAlert component has been removed to match the original Login.jsx structure (using alert()).

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'player'
  });
  
  // Removed alertMessage state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // NOTE: Reverting to alert() function to match the structure of the original Login.jsx
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      console.log(res.data);
      
      alert('Registered successfully! Please log in.'); // Use standard alert
      navigate('/login');
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.msg || 'Registration failed.'); // Use standard alert
    }
  };

  // --- STYLES COPIED FROM LOGIN.JSX FOR BACKGROUND IMAGE LAYOUT ---

  const backgroundContainerStyle = {
    // NOTE: Ensure you have an image at /images/601790.jpg
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

  const loginLinkStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#00d4ff', // Matches the primary theme color
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.3s ease',
    textShadow: '0 0 5px rgba(0, 212, 255, 0.3)',
    fontSize: '1.1rem',
  };

  // ----------------------------------------------------------------------

  return (
    <div style={backgroundContainerStyle}>
      {/* Dark overlay for better form readability */}
      <div style={overlayStyle} />
      
      {/* Form Wrapper (Central container) */}
      <div style={formWrapperStyle}>
        
        <h2>Gamebuzz Register</h2> 

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
          {/* Role Selection */}
          <select 
            name="role" 
            onChange={handleChange}
            // Applying a simplified style for visual consistency with inputs
            style={{
                padding: '15px',
                margin: '10px 0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                color: 'white',
                fontSize: '1rem',
                WebkitAppearance: 'none',
                appearance: 'none',
            }}
          >
            <option value="player">Player</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          
          <button type="submit">Register</button>
        </form>

        {/* Link to Login Page */}
        <p 
          onClick={() => navigate('/login')} 
          style={loginLinkStyle}
        >
          Already have an account? Login here.
        </p>
      </div>
    </div>
  );
}

export default Register;