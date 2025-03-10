export async function POST(request) {
  try {
    const { action, password } = await request.json();
    
    // Simple authentication - in a real app, use proper authentication
    if (password !== 'windowspace') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    // Handle different admin actions
    switch (action) {
      case 'clearBids':
        // Clear all bids
        global.bids = [];
        return new Response(JSON.stringify({ success: true, message: 'All bids cleared' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
        
      case 'resetAuction':
        // Reset the entire auction
        global.bids = [];
        global.winningBid = null;
        global.showWinner = false;
        global.isAuctionEnded = false;
        
        // Set new end time (3 days from now)
        const newEndTime = new Date();
        newEndTime.setDate(newEndTime.getDate() + 3);
        global.auctionEndTime = newEndTime.toISOString();
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Auction reset',
          endTime: global.auctionEndTime
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
        
      case 'updateEndTime':
        const { endTime } = await request.json();
        if (!endTime) {
          return new Response(JSON.stringify({ error: 'End time is required' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
          });
        }
        
        global.auctionEndTime = endTime;
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'End time updated',
          endTime: global.auctionEndTime
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to perform admin action' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
} 