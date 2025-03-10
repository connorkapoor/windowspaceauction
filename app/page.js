'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BidForm from '../components/BidForm';
import BidList from '../components/BidList';
import WinnerModal from '../components/WinnerModal';
import TweetEmbed from '../components/TweetEmbed';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [bids, setBids] = useState([]);
  const [showWinner, setShowWinner] = useState(false);
  const [winningBid, setWinningBid] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);

  // Load bids from localStorage on initial render
  useEffect(() => {
    const savedBids = localStorage.getItem('windowAuctionBids');
    if (savedBids) {
      setBids(JSON.parse(savedBids));
    }
    
    const savedWinningBid = localStorage.getItem('windowAuctionWinningBid');
    if (savedWinningBid) {
      setWinningBid(JSON.parse(savedWinningBid));
      setShowWinner(localStorage.getItem('windowAuctionShowWinner') === 'true');
    }
    
    const savedIsAuctionEnded = localStorage.getItem('windowAuctionIsEnded');
    if (savedIsAuctionEnded) {
      setIsAuctionEnded(savedIsAuctionEnded === 'true');
    }
  }, []);

  // Save bids to localStorage whenever they change
  useEffect(() => {
    if (bids.length > 0) {
      localStorage.setItem('windowAuctionBids', JSON.stringify(bids));
    }
  }, [bids]);

  // Save winning bid and auction state to localStorage
  useEffect(() => {
    if (winningBid) {
      localStorage.setItem('windowAuctionWinningBid', JSON.stringify(winningBid));
    }
    localStorage.setItem('windowAuctionShowWinner', showWinner.toString());
    localStorage.setItem('windowAuctionIsEnded', isAuctionEnded.toString());
  }, [winningBid, showWinner, isAuctionEnded]);

  // Set auction end time from localStorage or default to 3 days from now
  useEffect(() => {
    let endTime;
    const storedEndTime = localStorage.getItem('auctionEndTime');
    
    if (storedEndTime) {
      endTime = new Date(parseInt(storedEndTime));
    } else {
      // Default to 3 days from now if not set
      endTime = new Date();
      endTime.setDate(endTime.getDate() + 3);
      localStorage.setItem('auctionEndTime', endTime.getTime().toString());
    }
    
    // Check if auction has already ended
    const now = new Date();
    if (endTime <= now) {
      setIsAuctionEnded(true);
      if (bids.length > 0 && !winningBid) {
        const winner = [...bids].sort((a, b) => b.amount - a.amount)[0];
        setWinningBid(winner);
        setShowWinner(true);
      }
      return;
    }
    
    const interval = setInterval(() => {
      const now = new Date();
      const difference = endTime - now;
      
      if (difference <= 0) {
        clearInterval(interval);
        setIsAuctionEnded(true);
        
        // Find the winning bid
        if (bids.length > 0) {
          const winner = [...bids].sort((a, b) => b.amount - a.amount)[0];
          setWinningBid(winner);
          setShowWinner(true);
        }
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [bids, winningBid]);

  const handleBid = (username, amount) => {
    if (isAuctionEnded) return;
    
    const newBid = {
      id: Date.now(),
      username,
      amount: parseFloat(amount),
      timestamp: new Date().toISOString()
    };
    
    setBids(prevBids => [...prevBids, newBid]);
  };

  const handleCloseWinner = () => {
    setShowWinner(false);
    localStorage.setItem('windowAuctionShowWinner', 'false');
  };

  return (
    <main className={styles.main}>
      <motion.div 
        className={styles.header}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={styles.title}>🪟 WINDOW SPACE AUCTION 🪟</h1>
        <p className={styles.subtitle}>Bid on this prime window real estate!</p>
        {timeLeft && <div className={styles.timer}>Time remaining: {timeLeft}</div>}
      </motion.div>

      <div className={styles.container}>
        <motion.div 
          className={styles.imageContainer}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <TweetEmbed tweetUrl="https://x.com/pronounced_kyle/status/1898944062646005926" />
          <div className={styles.imageOverlay}>
            <p>Premium Window Space</p>
            <p>Perfect for your tiny figurines!</p>
          </div>
        </motion.div>

        <motion.div 
          className={styles.bidSection}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <BidForm onBid={handleBid} isAuctionEnded={isAuctionEnded} />
          <BidList bids={bids} />
        </motion.div>
      </div>

      {showWinner && (
        <WinnerModal 
          winner={winningBid} 
          onClose={handleCloseWinner} 
        />
      )}
      
      <div className={styles.adminLink}>
        <Link href="/admin">Admin Panel</Link>
      </div>
      
      <footer className={styles.footer}>
        <p>
          vibe coded by{' '}
          <a 
            href="https://twitter.com/connor_kapoor" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            @connor_kapoor
          </a>{' '}
          from{' '}
          <a 
            href="https://digicastmetal.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            digicastmetal.com
          </a>
        </p>
      </footer>
    </main>
  );
} 