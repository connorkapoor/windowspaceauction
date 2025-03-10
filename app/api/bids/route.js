export async function GET() {
  try {
    // For now, we'll use a simple file-based approach that works on Vercel
    // In a production app, you would use a database like Vercel KV, MongoDB, etc.
    
    // Return the bids from our "database"
    const bids = global.bids || [];
    
    return new Response(JSON.stringify(bids), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch bids' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function POST(request) {
  try {
    const bid = await request.json();
    
    // Validate the bid
    if (!bid.username || !bid.amount) {
      return new Response(JSON.stringify({ error: 'Invalid bid data' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Initialize global bids array if it doesn't exist
    if (!global.bids) {
      global.bids = [];
    }
    
    // Add the new bid
    const newBid = {
      id: Date.now(),
      username: bid.username,
      amount: parseFloat(bid.amount),
      timestamp: new Date().toISOString()
    };
    
    global.bids.push(newBid);
    
    return new Response(JSON.stringify(newBid), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to add bid' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
} 