'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './WinnerModal.module.css';

export default function WinnerModal({ winner, onClose }) {
  const confettiRef = useRef(null);
  
  useEffect(() => {
    // Import confetti dynamically to avoid SSR issues
    import('confetti-js').then(confettiJS => {
      const confettiSettings = {
        target: 'confetti-canvas',
        max: 200,
        size: 1.5,
        animate: true,
        props: ['circle', 'square', 'triangle', 'line'],
        colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]],
        clock: 25,
        rotate: true,
        start_from_edge: true,
        respawn: true
      };
      
      confettiRef.current = new confettiJS.default(confettiSettings);
      confettiRef.current.render();
    });
    
    return () => {
      if (confettiRef.current) {
        confettiRef.current.clear();
      }
    };
  }, []);
  
  // Generate Venmo link with pre-filled amount
  const venmoLink = `https://venmo.com/?txn=pay&audience=private&recipients=windowowner&amount=${winner.amount}&note=Window%20Space%20Auction%20Payment`;

  // Function to create Twitter profile URL from username
  const getTwitterProfileUrl = (username) => {
    // Remove @ if it exists at the beginning
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    return `https://twitter.com/${cleanUsername}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <canvas id="confetti-canvas" className={styles.confettiCanvas}></canvas>
      
      <motion.div 
        className={styles.modalContent}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.winnerTitle}>🎉 We Have a Winner! 🎉</h2>
        
        <div className={styles.winnerInfo}>
          <div className={styles.trophy}>🏆</div>
          <div className={styles.winnerDetails}>
            <p className={styles.winnerName}>
              <a 
                href={getTwitterProfileUrl(winner.username)} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.usernameLink}
              >
                {winner.username}
              </a>
            </p>
            <p className={styles.winnerBid}>${winner.amount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className={styles.congratsMessage}>
          <p>Congratulations on winning the exclusive window space!</p>
          <p>Please complete your payment using the link below:</p>
        </div>
        
        <a 
          href={venmoLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.venmoButton}
        >
          Pay with Venmo
        </a>
        
        <div className={styles.instructions}>
          <h3>Next Steps:</h3>
          <ol>
            <li>Complete your payment using the Venmo link</li>
            <li>Send a DM to the window owner on X</li>
            <li>Arrange delivery of your items for the window space</li>
          </ol>
        </div>
        
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </motion.div>
    </div>
  );
} 