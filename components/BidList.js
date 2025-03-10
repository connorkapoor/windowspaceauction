'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BidList.module.css';

export default function BidList({ bids }) {
  const [sortBy, setSortBy] = useState('time-desc');
  
  const getSortedBids = () => {
    return [...bids].sort((a, b) => {
      switch (sortBy) {
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'time-asc':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'time-desc':
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' ' + date.toLocaleDateString();
  };

  const sortedBids = getSortedBids();
  const highestBid = bids.length > 0 
    ? bids.reduce((max, bid) => bid.amount > max.amount ? bid : max, bids[0])
    : null;

  return (
    <div className={styles.bidListContainer}>
      <div className={styles.bidListHeader}>
        <h2 className={styles.bidListTitle}>Current Bids</h2>
        {highestBid && (
          <div className={styles.highestBid}>
            Highest Bid: <span>${highestBid.amount.toFixed(2)}</span> by {highestBid.username}
          </div>
        )}
      </div>
      
      <div className={styles.sortControls}>
        <label htmlFor="sortBy">Sort by:</label>
        <select 
          id="sortBy" 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="time-desc">Newest First</option>
          <option value="time-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>
      
      {bids.length === 0 ? (
        <div className={styles.noBids}>
          No bids yet. Be the first to bid!
        </div>
      ) : (
        <div className={styles.bidList}>
          <AnimatePresence>
            {sortedBids.map((bid) => (
              <motion.div 
                key={bid.id}
                className={`${styles.bidItem} ${bid.id === highestBid?.id ? styles.highestBidItem : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={styles.bidInfo}>
                  <div className={styles.bidUser}>{bid.username}</div>
                  <div className={styles.bidAmount}>${bid.amount.toFixed(2)}</div>
                </div>
                <div className={styles.bidTime}>{formatTime(bid.timestamp)}</div>
                {bid.id === highestBid?.id && (
                  <div className={styles.leadingBadge}>LEADING</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
} 