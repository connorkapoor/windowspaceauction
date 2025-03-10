'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimeoutRef = useRef(null);
  const lastBidCountRef = useRef(0);

  // Memoized function to fetch bids to prevent unnecessary re-renders
  const fetchBids = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      
      // Fetch bids with cache-busting query parameter
      const bidsResponse = await fetch(`/api/bids?t=${Date.now()}`);
      if (!bidsResponse.ok) {
        throw new Error('Failed to fetch bids');
      }
      
      const bidsData = await bidsResponse.json();
      
      // Only update state if the bid count has changed
      if (bidsData.length !== lastBidCountRef.current) {
        setBids(bidsData);
        lastBidCountRef.current = bidsData.length;
      }
      
      if (!silent) {
        setIsLoading(false);
      }
      
      return bidsData;
    } catch (error) {
      console.error('Error fetching bids:', error);
      if (!silent) {
        setError(error.message);
        setIsLoading(false);
      }
      
      // Fallback to localStorage if API fails
      const savedBids = localStorage.getItem('windowAuctionBids');
      if (savedBids) {
        const parsedBids = JSON.parse(savedBids);
        setBids(parsedBids);
        return parsedBids;
      }
      
      return [];
    }
  }, []);

  // Memoized function to fetch auction settings
  const fetchAuctionSettings = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      
      // Fetch auction settings with cache-busting query parameter
      const settingsResponse = await fetch(`/api/auction?t=${Date.now()}`);
      if (!settingsResponse.ok) {
        throw new Error('Failed to fetch auction settings');
      }
      
      const settingsData = await settingsResponse.json();
      
      if (!silent) {
        setIsLoading(false);
      }
      
      return settingsData;
    } catch (error) {
      console.error('Error fetching auction settings:', error);
      if (!silent) {
        setError(error.message);
        setIsLoading(false);
      }
      
      return null;
    }
  }, []);

  // Load initial data and set up refresh interval
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch bids and auction settings in parallel
        const [bidsData, settingsData] = await Promise.all([
          fetchBids(true),
          fetchAuctionSettings(true)
        ]);
        
        // Process auction settings
        if (settingsData && settingsData.endTime) {
          // Check if auction has already ended
          const endTime = new Date(settingsData.endTime);
          const now = new Date();
          
          if (endTime <= now) {
            setIsAuctionEnded(true);
            if (bidsData.length > 0) {
              const winner = [...bidsData].sort((a, b) => b.amount - a.amount)[0];
              setWinningBid(winner);
              setShowWinner(settingsData.showWinner);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    loadInitialData();
    
    // Set up a single refresh interval (every 15 seconds)
    const refreshInterval = setInterval(() => {
      // Use silent refresh to avoid showing loading state
      fetchBids(true);
    }, 15000);
    
    return () => {
      clearInterval(refreshInterval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchBids, fetchAuctionSettings]);

  // Set auction end time and countdown timer
  useEffect(() => {
    const setupAuctionTimer = async () => {
      try {
        // Get auction settings
        const settingsData = await fetchAuctionSettings(true);
        
        let endTime;
        if (settingsData && settingsData.endTime) {
          endTime = new Date(settingsData.endTime);
        } else {
          // Default to 3 days from now if not set
          endTime = new Date();
          endTime.setDate(endTime.getDate() + 3);
          
          // Save the default end time
          await fetch('/api/auction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endTime: endTime.toISOString() }),
          });
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
              
              // Update auction settings
              fetch('/api/auction', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  isEnded: true,
                  winningBid: winner,
                  showWinner: true
                }),
              });
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
      } catch (error) {
        console.error('Error setting up auction timer:', error);
      }
    };
    
    setupAuctionTimer();
  }, [fetchAuctionSettings, bids]);

  const handleBid = async (username, amount) => {
    if (isAuctionEnded) return;
    
    const newBid = {
      username,
      amount: parseFloat(amount)
    };
    
    try {
      // Send the bid to the API
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBid),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add bid');
      }
      
      const addedBid = await response.json();
      
      // Update local state immediately
      setBids(prevBids => [...prevBids, addedBid]);
      lastBidCountRef.current = bids.length + 1;
      
      // Fallback: also save to localStorage
      localStorage.setItem('windowAuctionBids', JSON.stringify([...bids, addedBid]));
      
      // Schedule a refresh after a short delay to ensure we have the latest data
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        fetchBids(true);
      }, 2000);
    } catch (error) {
      console.error('Error adding bid:', error);
      
      // Fallback: add to local state only
      const fallbackBid = {
        id: Date.now(),
        username,
        amount: parseFloat(amount),
        timestamp: new Date().toISOString()
      };
      
      setBids(prevBids => [...prevBids, fallbackBid]);
      localStorage.setItem('windowAuctionBids', JSON.stringify([...bids, fallbackBid]));
    }
  };

  const handleCloseWinner = async () => {
    setShowWinner(false);
    
    try {
      // Update auction settings
      await fetch('/api/auction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showWinner: false }),
      });
    } catch (error) {
      console.error('Error updating winner visibility:', error);
      
      // Fallback to localStorage
      localStorage.setItem('windowAuctionShowWinner', 'false');
    }
  };

  if (isLoading && bids.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading auction data...</p>
      </div>
    );
  }

  if (error && bids.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Auction</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

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
        <p className={styles.fontNotice}>
          Comic Sans MS font provided by OnlineWebFonts.com
        </p>
      </footer>
    </main>
  );
} 