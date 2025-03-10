import { getBids, addBid } from '../../../lib/db';

export async function GET() {
  try {
    const bids = await getBids();
    
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
    
    // Add the new bid
    const newBid = await addBid(bid);
    
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