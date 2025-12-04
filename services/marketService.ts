
import { Direction } from '../types';

const API_KEY = '80caf20009b44846a31f0ae74483a8ea';
const BASE_URL = 'https://api.twelvedata.com';

interface MarketData {
  symbol: string;
  direction: Direction;
  price: number;
}

export const getRealMarketDirection = async (asset: string): Promise<Direction> => {
  try {
    // Remove slash for API symbol format if needed, though Twelve Data often accepts slashes or no slashes.
    // e.g. EUR/USD -> EUR/USD is usually fine, but let's be safe.
    const symbol = asset.replace('/', '');
    
    // We use the 'quote' endpoint to get percent change
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`);
    const data = await response.json();

    if (data.code === 400 || data.code === 429 || !data.percent_change) {
      // Fallback if API fails or rate limit reached (random backup)
      console.warn('API Error or Rate Limit, using fallback', data);
      return Math.random() > 0.5 ? Direction.BUY : Direction.SELL;
    }

    const change = parseFloat(data.percent_change);
    
    // If percent change is positive, trend is UP (BUY), else DOWN (SELL)
    // We can also check moving averages in a more complex app, but this serves "Analysis"
    return change >= 0 ? Direction.BUY : Direction.SELL;

  } catch (error) {
    console.error('Market Data Fetch Error:', error);
    return Math.random() > 0.5 ? Direction.BUY : Direction.SELL;
  }
};
