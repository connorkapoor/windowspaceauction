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
  const [bidCount, setBidCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsLoggedIn(true);
      loadCurrentEndTime();
      loadBidCount();
    }
  }, []);

  const loadBidCount = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bids');
      if (!response.ok) {
        throw new Error('Failed to fetch bids');
      }
      const bids = await response.json();
      setBidCount(bids.length);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading bid count:', error);
      setIsLoading(false);
      
      // Fallback to localStorage
      const savedBids = localStorage.getItem('windowAuctionBids');
      if (savedBids) {
        const bids = JSON.parse(savedBids);
        setBidCount(bids.length);
      }
    }
  };

  const loadCurrentEndTime = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auction');
      if (!response.ok) {
        throw new Error('Failed to fetch auction settings');
      }
      const data = await response.json();
      
      if (data.endTime) {
        const endTime = new Date(data.endTime);
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading end time:', error);
      setIsLoading(false);
      
      // Fallback to localStorage
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
      }
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
      loadBidCount();
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const handleEndTimeChange = async (e) => {
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
    
    try {
      setIsLoading(true);
      
      // Update end time via API
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateEndTime',
          password: 'windowspace',
          endTime: newEndTimeDate.toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update end time');
      }
      
      setCurrentEndTime(newEndTimeDate);
      setSuccessMessage('Auction end time updated successfully!');
      setIsLoading(false);
      
      // Fallback: also save to localStorage
      localStorage.setItem('auctionEndTime', newEndTimeDate.getTime().toString());
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating end time:', error);
      setLoginError('Failed to update end time');
      setIsLoading(false);
      
      // Fallback: save to localStorage only
      localStorage.setItem('auctionEndTime', newEndTimeDate.getTime().toString());
      setCurrentEndTime(newEndTimeDate);
      setSuccessMessage('Auction end time updated successfully (offline mode)!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  const handleClearBids = async () => {
    if (window.confirm('Are you sure you want to clear all bids? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        
        // Clear bids via API
        const response = await fetch('/api/admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'clearBids',
            password: 'windowspace'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to clear bids');
        }
        
        setBidCount(0);
        setSuccessMessage('All bids have been cleared successfully!');
        setIsLoading(false);
        
        // Fallback: also clear localStorage
        localStorage.removeItem('windowAuctionBids');
        localStorage.removeItem('windowAuctionWinningBid');
        localStorage.setItem('windowAuctionShowWinner', 'false');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error clearing bids:', error);
        setLoginError('Failed to clear bids');
        setIsLoading(false);
        
        // Fallback: clear localStorage only
        localStorage.removeItem('windowAuctionBids');
        localStorage.removeItem('windowAuctionWinningBid');
        localStorage.setItem('windowAuctionShowWinner', 'false');
        
        setBidCount(0);
        setSuccessMessage('All bids have been cleared successfully (offline mode)!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    }
  };

  const handleResetAuction = async () => {
    if (window.confirm('Are you sure you want to reset the entire auction? This will clear all bids and reset the end time. This action cannot be undone.')) {
      try {
        setIsLoading(true);
        
        // Reset auction via API
        const response = await fetch('/api/admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'resetAuction',
            password: 'windowspace'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to reset auction');
        }
        
        const data = await response.json();
        
        // Set new end time
        const newEndTime = new Date(data.endTime);
        setCurrentEndTime(newEndTime);
        
        // Format for datetime-local input
        const year = newEndTime.getFullYear();
        const month = String(newEndTime.getMonth() + 1).padStart(2, '0');
        const day = String(newEndTime.getDate()).padStart(2, '0');
        const hours = String(newEndTime.getHours()).padStart(2, '0');
        const minutes = String(newEndTime.getMinutes()).padStart(2, '0');
        
        setNewEndTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        
        setBidCount(0);
        setSuccessMessage('Auction has been completely reset!');
        setIsLoading(false);
        
        // Fallback: also reset localStorage
        localStorage.removeItem('windowAuctionBids');
        localStorage.removeItem('windowAuctionWinningBid');
        localStorage.setItem('windowAuctionShowWinner', 'false');
        localStorage.setItem('windowAuctionIsEnded', 'false');
        localStorage.setItem('auctionEndTime', newEndTime.getTime().toString());
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error resetting auction:', error);
        setLoginError('Failed to reset auction');
        setIsLoading(false);
        
        // Fallback: reset localStorage only
        const newEndTime = new Date();
        newEndTime.setDate(newEndTime.getDate() + 3);
        
        localStorage.removeItem('windowAuctionBids');
        localStorage.removeItem('windowAuctionWinningBid');
        localStorage.setItem('windowAuctionShowWinner', 'false');
        localStorage.setItem('windowAuctionIsEnded', 'false');
        localStorage.setItem('auctionEndTime', newEndTime.getTime().toString());
        
        setCurrentEndTime(newEndTime);
        setBidCount(0);
        
        // Format for datetime-local input
        const year = newEndTime.getFullYear();
        const month = String(newEndTime.getMonth() + 1).padStart(2, '0');
        const day = String(newEndTime.getDate()).padStart(2, '0');
        const hours = String(newEndTime.getHours()).padStart(2, '0');
        const minutes = String(newEndTime.getMinutes()).padStart(2, '0');
        
        setNewEndTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        
        setSuccessMessage('Auction has been completely reset (offline mode)!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    }
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
            {isLoading && <div className={styles.loadingMessage}>Loading...</div>}
            
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
                
                <button 
                  type="submit" 
                  className={styles.updateButton}
                  disabled={isLoading}
                >
                  Update End Time
                </button>
              </form>
            </div>
            
            <div className={styles.bidManagement}>
              <h3>Bid Management</h3>
              
              <div className={styles.bidStats}>
                <p>Current Bid Count: <span className={styles.bidCount}>{bidCount}</span></p>
              </div>
              
              <div className={styles.bidActions}>
                <button 
                  onClick={handleClearBids} 
                  className={`${styles.actionButton} ${styles.dangerButton}`}
                  disabled={bidCount === 0 || isLoading}
                >
                  Clear All Bids
                </button>
                
                <button 
                  onClick={handleResetAuction} 
                  className={`${styles.actionButton} ${styles.dangerButton}`}
                  disabled={isLoading}
                >
                  Reset Entire Auction
                </button>
              </div>
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