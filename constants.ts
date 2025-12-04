
export const TRADING_PLATFORMS = [
  'Pocket Option',
  'Quotex',
  'Binomo',
  'IQ Option',
  'Real Market'
];

export const PLATFORM_ASSETS: Record<string, string[]> = {
  'Pocket Option': [
    'EUR/USD OTC', 
    'AUD/CAD OTC', 
    'AUD/CHF OTC', 
    'AUD/NZD OTC', 
    'CAD/CHF OTC', 
    'CHF/JPY OTC', 
    'EUR/CHF OTC', 
    'USD/JPY OTC'
  ],
  'Quotex': ['EUR/USD (OTC)', 'GBP/USD (OTC)', 'USD/BRL (OTC)', 'USD/INR (OTC)', 'USD/BDT (OTC)', 'Intel OTC', 'Boeing OTC'],
  'Binomo': ['Crypto IDX', 'EUR/USD', 'GBP/USD', 'Altcoin IDX', 'Bitcoin', 'Ethereum'],
  'IQ Option': ['EUR/USD', 'GBP/USD', 'AUD/USD', 'USD/CAD', 'EUR/JPY', 'GBP/JPY'],
  'Real Market': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY']
};

export const ANALYSIS_STRATEGIES = [
  'Martingale Level 1',
  'Martingale Level 2'
];

export const PREDICTION_MODELS = [
  'Broker AI Mode (98% Win)',
  'Real Market Direct',
  'Tesla Neural Engine'
];

export const SUCCESS_RATES = [
  '80-85% (Standard)',
  '85-90% (Premium)',
  '90-95% (Tesla AI)'
];
