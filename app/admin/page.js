'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentEndTime, setCurrentEndTime] = useState(null);
  const [newEndTime, setNewEndTime] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsLoggedIn(true);
      loadCurrentEndTime();
    }
  }, []);

  const loadCurrentEndTime = () => {
    const storedEndTime = localStorage.getItem('auctionEndTime');
    if (storedEndTime) {
      const endTime = new Date(parseInt(storedEndTime));
      setCurrentEndTime(endTime);
      
      // Format for datetime-local input
      const year = endTime.getFullYear();
      const month = String(endTime.getMonth() + 1).padStart(2, '0');
      const day = String(endTime.getDate()).padStart(2, '0');
      const hours = String(endTime.getHours()).padStart(2, '0');
      const minutes = String(endTime.getMinutes()).padStart(2, '0');
      
      setNewEndTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      // Default to 3 days from now if not set
      const defaultEndTime = new Date();
      defaultEndTime.setDate(defaultEndTime.getDate() + 3);
      setCurrentEndTime(defaultEndTime);
      
      // Format for datetime-local input
      const year = defaultEndTime.getFullYear();
      const month = String(defaultEndTime.getMonth() + 1).padStart(2, '0');
      const day = String(defaultEndTime.getDate()).padStart(2, '0');
      const hours = String(defaultEndTime.getHours()).padStart(2, '0');
      const minutes = String(defaultEndTime.getMinutes()).padStart(2, '0');
      
      setNewEndTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple authentication - in a real app, use proper authentication
    if (username === 'admin' && password === 'windowspace') {
      localStorage.setItem('adminToken', 'admin-logged-in');
      setIsLoggedIn(true);
      setLoginError('');
      loadCurrentEndTime();
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const handleEndTimeChange = (e) => {
    e.preventDefault();
    
    if (!newEndTime) {
      setLoginError('Please select a valid end time');
      return;
    }
    
    const newEndTimeDate = new Date(newEndTime);
    const now = new Date();
    
    if (newEndTimeDate <= now) {
      setLoginError('End time must be in the future');
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('auctionEndTime', newEndTimeDate.getTime().toString());
    setCurrentEndTime(newEndTimeDate);
    setSuccessMessage('Auction end time updated successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminCard}>
        <h1 className={styles.adminTitle}>Admin Dashboard</h1>
        
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <h2>Login to Admin Panel</h2>
            
            {loginError && <div className={styles.errorMessage}>{loginError}</div>}
            
            <div className={styles.inputGroup}>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
        ) : (
          <div className={styles.adminPanel}>
            <div className={styles.welcomeMessage}>
              <h2>Welcome, Admin!</h2>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
            
            {loginError && <div className={styles.errorMessage}>{loginError}</div>}
            {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
            
            <div className={styles.auctionSettings}>
              <h3>Auction End Time Settings</h3>
              
              {currentEndTime && (
                <div className={styles.currentTime}>
                  <p>Current End Time:</p>
                  <p className={styles.timeDisplay}>
                    {currentEndTime.toLocaleString()}
                  </p>
                </div>
              )}
              
              <form onSubmit={handleEndTimeChange} className={styles.endTimeForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="newEndTime">New End Time:</label>
                  <input
                    type="datetime-local"
                    id="newEndTime"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                
                <button type="submit" className={styles.updateButton}>
                  Update End Time
                </button>
              </form>
            </div>
          </div>
        )}
        
        <Link href="/" className={styles.backLink}>
          ← Back to Auction
        </Link>
      </div>
    </div>
  );
} 