// src/pages/Register.jsx (Complete version)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullname: '',
    password: '',
    confirmPassword: '',
    avatar: null,
    coverImage: null
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.email.trim() || 
        !formData.fullname.trim() || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.avatar) {
      setError('Avatar image is required');
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-logo">
          <div className="auth-logo-icon">YT</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Or <Link to="/login">sign in to existing account</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              name="fullname"
              type="text"
              required
              value={formData.fullname}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter full name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ whiteSpace: 'nowrap', height: 44 }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                style={{ whiteSpace: 'nowrap', height: 44 }}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Avatar Image *</label>
            <input
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-input"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image (Optional)</label>
            <input
              name="coverImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;