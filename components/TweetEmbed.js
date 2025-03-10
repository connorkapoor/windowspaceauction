'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './TweetEmbed.module.css';

export default function TweetEmbed({ tweetUrl }) {
  const tweetContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Clean up any existing Twitter widgets
    if (window.twttr && tweetContainerRef.current) {
      tweetContainerRef.current.innerHTML = '';
    }
    
    setIsLoading(true);
    setLoadError(false);

    // Set a timeout to detect if tweet doesn't load
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setLoadError(true);
      }
    }, 10000); // 10 seconds timeout

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
    }

    return () => {
      // Clean up
      clearTimeout(timeoutId);
      if (tweetContainerRef.current) {
        tweetContainerRef.current.innerHTML = '';
      }
    };
  }, [tweetUrl, isLoading]);

  // Extract tweet ID from URL
  const extractTweetId = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className={styles.tweetContainer} ref={tweetContainerRef}>
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