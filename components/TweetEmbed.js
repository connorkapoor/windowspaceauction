'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './TweetEmbed.module.css';

export default function TweetEmbed({ tweetUrl }) {
  const tweetContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const loadAttemptedRef = useRef(false);
  const observerRef = useRef(null);

  useEffect(() => {
    // Reset state when the URL changes
    setIsLoading(true);
    setLoadError(false);
    loadAttemptedRef.current = false;
    
    // Clean up any existing Twitter widgets
    if (window.twttr && tweetContainerRef.current) {
      // Safer cleanup - just empty the innerHTML instead of removing children
      tweetContainerRef.current.innerHTML = '';
    }

    // Prevent multiple load attempts
    if (loadAttemptedRef.current) return;
    loadAttemptedRef.current = true;
    
    // Set a timeout to detect if tweet doesn't load
    const timeoutId = setTimeout(() => {
      setLoadError(true);
      setIsLoading(false);
    }, 10000); // 10 seconds timeout

    // Set up a MutationObserver to detect when the tweet is loaded
    if (tweetContainerRef.current) {
      // Disconnect any existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Create a new observer
      observerRef.current = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if the tweet iframe has been added
            const tweetExists = tweetContainerRef.current.querySelector('iframe') || 
                               tweetContainerRef.current.querySelector('.twitter-tweet-rendered') ||
                               tweetContainerRef.current.querySelector('.twitter-tweet');
            
            if (tweetExists) {
              setIsLoading(false);
              clearTimeout(timeoutId);
              observerRef.current.disconnect();
              break;
            }
          }
        }
      });
      
      // Start observing
      observerRef.current.observe(tweetContainerRef.current, {
        childList: true,
        subtree: true
      });
    }

    // Load Twitter widget script if it's not already loaded
    if (!window.twttr) {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
      script.setAttribute('async', 'true');
      document.head.appendChild(script);
      
      script.onload = () => {
        if (tweetContainerRef.current) {
          renderTweet();
        }
      };
      
      script.onerror = () => {
        setLoadError(true);
        setIsLoading(false);
        clearTimeout(timeoutId);
      };
    } else if (tweetContainerRef.current) {
      renderTweet();
    }

    function renderTweet() {
      try {
        if (!tweetContainerRef.current) return;
        
        window.twttr.widgets.createTweet(
          extractTweetId(tweetUrl),
          tweetContainerRef.current,
          {
            theme: 'light',
            dnt: true,
            width: '100%',
          }
        ).then(el => {
          setIsLoading(false);
          clearTimeout(timeoutId);
          if (!el) {
            setLoadError(true);
          }
        }).catch(() => {
          setLoadError(true);
          setIsLoading(false);
          clearTimeout(timeoutId);
        });
      } catch (error) {
        console.error("Error rendering tweet:", error);
        setLoadError(true);
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    }

    return () => {
      // Clean up
      clearTimeout(timeoutId);
      
      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Safer cleanup approach
      if (tweetContainerRef.current) {
        try {
          // Just empty the container instead of removing children
          tweetContainerRef.current.innerHTML = '';
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, [tweetUrl]); // Only re-run when tweetUrl changes

  // Extract tweet ID from URL
  const extractTweetId = (url) => {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch (error) {
      console.error("Error extracting tweet ID:", error);
      return '';
    }
  };

  return (
    <div className={styles.tweetContainer}>
      <div ref={tweetContainerRef} className={styles.tweetContent}></div>
      
      {isLoading && !loadError && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading tweet...</p>
        </div>
      )}
      
      {loadError && (
        <div className={styles.errorContainer}>
          <p>Could not load the tweet.</p>
          <p className={styles.tweetInfo}>
            This is a window space auction for the window shown in the tweet by @pronounced_kyle.
          </p>
          <a 
            href={tweetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.tweetLink}
          >
            View the original tweet
          </a>
        </div>
      )}
    </div>
  );
} 