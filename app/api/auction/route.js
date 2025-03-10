import { getAuctionSettings, updateAuctionSettings } from '../../../lib/db';

export async function GET() {
  try {
    const settings = await getAuctionSettings();
    
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
    const updatedSettings = await updateAuctionSettings(settings);
    
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