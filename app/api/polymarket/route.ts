import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Polymarket trending markets via GAMMA API or CLOB API.
    // Gamma API /trending endpoint is common for fetching trending markets.
    const response = await fetch('https://gamma-api.polymarket.com/events?active=true&trending=true&limit=10', {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Polymarket API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Map the response to a simpler format for our component
    const markets = data.map((event: any) => {
      // Find the main market (usually the first one if it's a binary outcome)
      const market = event.markets && event.markets[0];
      
      if (!market) return null;

      // Polymarket returns odds as a string or number, we want to format them as percentages
      let outcomes = [];
      try {
        outcomes = JSON.parse(market.outcomePrices || '[]');
      } catch (e) {
        console.error('Error parsing outcomePrices:', e);
        outcomes = [];
      }
      const yesPrice = outcomes.length > 0 ? parseFloat(outcomes[0]) : null;
      
      return {
        id: market.id,
        question: event.title || market.question,
        image: event.image,
        yesChance: yesPrice ? Math.round(yesPrice * 100) : null,
        category: event.category,
      };
    }).filter(Boolean);

    return NextResponse.json(markets);
  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    return NextResponse.json({ error: 'Failed to fetch prediction markets' }, { status: 500 });
  }
}
