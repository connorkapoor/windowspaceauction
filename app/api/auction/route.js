export async function GET() {
  try {
    // Return the auction settings
    const settings = {
      endTime: global.auctionEndTime || getDefaultEndTime(),
      isEnded: global.isAuctionEnded || false,
      winningBid: global.winningBid || null,
      showWinner: global.showWinner || false
    };
    
    return new Response(JSON.stringify(settings), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch auction settings' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function POST(request) {
  try {
    const settings = await request.json();
    
    // Update auction settings
    if (settings.endTime) {
      global.auctionEndTime = settings.endTime;
    }
    
    if (settings.isEnded !== undefined) {
      global.isAuctionEnded = settings.isEnded;
    }
    
    if (settings.winningBid) {
      global.winningBid = settings.winningBid;
    }
    
    if (settings.showWinner !== undefined) {
      global.showWinner = settings.showWinner;
    }
    
    // Return the updated settings
    const updatedSettings = {
      endTime: global.auctionEndTime || getDefaultEndTime(),
      isEnded: global.isAuctionEnded || false,
      winningBid: global.winningBid || null,
      showWinner: global.showWinner || false
    };
    
    return new Response(JSON.stringify(updatedSettings), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update auction settings' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Helper function to get default end time (3 days from now)
function getDefaultEndTime() {
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + 3);
  return endTime.toISOString();
} 