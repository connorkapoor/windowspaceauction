import { put, list, del } from '@vercel/blob';

// Fallback in-memory storage for local development or if Blob is not available
let localBids = [];
let localAuctionSettings = {
  endTime: null,
  isEnded: false,
  winningBid: null,
  showWinner: false
};

// Blob storage keys
const BIDS_BLOB_KEY = 'auction/bids.json';
const SETTINGS_BLOB_KEY = 'auction/settings.json';

// Helper function to check if Vercel Blob is available
const isBlobAvailable = () => {
  return process.env.BLOB_READ_WRITE_TOKEN !== undefined;
};

// Bid functions
export async function getBids() {
  try {
    if (isBlobAvailable()) {
      // Check if the bids blob exists
      const blobs = await list();
      const bidsBlob = blobs.blobs.find(blob => blob.pathname === BIDS_BLOB_KEY);
      
      if (bidsBlob) {
        // Fetch the bids from the blob
        const response = await fetch(bidsBlob.url);
        if (response.ok) {
          const bids = await response.json();
          return bids;
        }
      }
      
      // If blob doesn't exist or fetch fails, return empty array
      return [];
    } else {
      return localBids;
    }
  } catch (error) {
    console.error('Error getting bids:', error);
    return localBids;
  }
}

export async function addBid(bid) {
  try {
    const bids = await getBids();
    const newBid = {
      id: Date.now(),
      username: bid.username,
      amount: parseFloat(bid.amount),
      timestamp: new Date().toISOString()
    };
    
    const updatedBids = [...bids, newBid];
    
    if (isBlobAvailable()) {
      // Store the updated bids in the blob
      await put(BIDS_BLOB_KEY, JSON.stringify(updatedBids), {
        access: 'public',
        addRandomSuffix: false,
      });
    } else {
      localBids = updatedBids;
    }
    
    return newBid;
  } catch (error) {
    console.error('Error adding bid:', error);
    throw error;
  }
}

export async function clearBids() {
  try {
    if (isBlobAvailable()) {
      // Delete the bids blob if it exists
      const blobs = await list();
      const bidsBlob = blobs.blobs.find(blob => blob.pathname === BIDS_BLOB_KEY);
      
      if (bidsBlob) {
        await del(bidsBlob.url);
      }
      
      // Create a new empty bids blob
      await put(BIDS_BLOB_KEY, JSON.stringify([]), {
        access: 'public',
        addRandomSuffix: false,
      });
    } else {
      localBids = [];
    }
    return true;
  } catch (error) {
    console.error('Error clearing bids:', error);
    throw error;
  }
}

// Auction settings functions
export async function getAuctionSettings() {
  try {
    if (isBlobAvailable()) {
      // Check if the settings blob exists
      const blobs = await list();
      const settingsBlob = blobs.blobs.find(blob => blob.pathname === SETTINGS_BLOB_KEY);
      
      if (settingsBlob) {
        // Fetch the settings from the blob
        const response = await fetch(settingsBlob.url);
        if (response.ok) {
          const settings = await response.json();
          return settings;
        }
      }
    }
    
    // If blob doesn't exist, fetch fails, or blob is not available, use local or create default
    if (!localAuctionSettings.endTime) {
      const defaultEndTime = new Date();
      defaultEndTime.setDate(defaultEndTime.getDate() + 3);
      localAuctionSettings.endTime = defaultEndTime.toISOString();
      
      // Save default settings to blob if available
      if (isBlobAvailable()) {
        await put(SETTINGS_BLOB_KEY, JSON.stringify(localAuctionSettings), {
          access: 'public',
          addRandomSuffix: false,
        });
      }
    }
    
    return localAuctionSettings;
  } catch (error) {
    console.error('Error getting auction settings:', error);
    return localAuctionSettings;
  }
}

export async function updateAuctionSettings(settings) {
  try {
    const currentSettings = await getAuctionSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    if (isBlobAvailable()) {
      // Store the updated settings in the blob
      await put(SETTINGS_BLOB_KEY, JSON.stringify(updatedSettings), {
        access: 'public',
        addRandomSuffix: false,
      });
    } else {
      localAuctionSettings = updatedSettings;
    }
    
    return updatedSettings;
  } catch (error) {
    console.error('Error updating auction settings:', error);
    throw error;
  }
}

export async function resetAuction() {
  try {
    // Clear bids
    await clearBids();
    
    // Reset auction settings
    const newEndTime = new Date();
    newEndTime.setDate(newEndTime.getDate() + 3);
    
    const resetSettings = {
      endTime: newEndTime.toISOString(),
      isEnded: false,
      winningBid: null,
      showWinner: false
    };
    
    if (isBlobAvailable()) {
      // Store the reset settings in the blob
      await put(SETTINGS_BLOB_KEY, JSON.stringify(resetSettings), {
        access: 'public',
        addRandomSuffix: false,
      });
    } else {
      localAuctionSettings = resetSettings;
    }
    
    return resetSettings;
  } catch (error) {
    console.error('Error resetting auction:', error);
    throw error;
  }
} 