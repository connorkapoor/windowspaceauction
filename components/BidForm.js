'use client';

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import styles from './BidForm.module.css';

// Memoize the BidForm component to prevent unnecessary re-renders
const BidForm = memo(function BidForm({ onBid, isAuctionEnded }) {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!username.trim()) {
      setError('Please enter your X username');
      return;
    }
    
    let finalUsername = username;
    if (!username.startsWith('@')) {
      finalUsername = '@' + username;
      setUsername(finalUsername);
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
      onBid(finalUsername, amount);
      setIsSubmitting(false);
      setUsername('');
      setAmount('');
      
      // Show success animation
      const successElement = document.createElement('div');
      successElement.className = styles.successAnimation;
      successElement.textContent = '🎉 Bid placed!';
      document.body.appendChild(successElement);
      
      setTimeout(() => {
        if (document.body.contains(successElement)) {
          document.body.removeChild(successElement);
        }
      }, 2000);
    }, 800);
  };

  if (isAuctionEnded) {
    return (
      <div className={styles.auctionEnded}>
        <h2>Auction has ended!</h2>
        <p>The winner will be contacted soon.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.formContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.formTitle}>Place Your Bid!</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="username">X Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@your_username"
            className={styles.input}
            disabled={isSubmitting}
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="amount">Bid Amount ($):</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter your bid"
            step="0.01"
            min="0.01"
            className={styles.input}
            disabled={isSubmitting}
          />
        </div>
        
        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSubmitting ? 'Submitting...' : 'Place Bid! 💰'}
        </motion.button>
      </form>
      
      <div className={styles.bidTips}>
        <h3>Bidding Tips:</h3>
        <ul>
          <li>Higher bids have a better chance of winning!</li>
          <li>All proceeds go to the window owner</li>
          <li>Winner gets exclusive rights to the window space</li>
        </ul>
      </div>
    </motion.div>
  );
});

export default BidForm; 