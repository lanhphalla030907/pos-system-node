// util/currency.js
export const CURRENCY_SYMBOLS = {
  USD: "$",
  KHR: "៛",
};

export const DEFAULT_RATE = 4000;

export const getCurrencyRate = (settings) =>
  parseFloat(settings?.currency_rate) || DEFAULT_RATE;

export const toDisplay = (amountUSD, currency = "USD", rate = DEFAULT_RATE) => {
  const num = parseFloat(amountUSD || 0);
  if (isNaN(num)) return 0;
  return currency === "KHR" ? num * rate : num;
};

export const toBase = (amountDisplay, currency = "USD", rate = DEFAULT_RATE) => {
  const num = parseFloat(amountDisplay || 0);
  if (isNaN(num)) return 0;
  return currency === "KHR" ? num / rate : num;
};

// Pure formatter: expects the value already in the display currency
// (for USD pass the USD value; for KHR pass the already-converted KHR value)
export const formatCurrency = (amount, currency = "USD") => {
  const num = parseFloat(amount || 0);
  if (isNaN(num)) return "";
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  if (currency === "KHR") {
    return `${symbol}${num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }
  return `${symbol}${num.toFixed(2)}`;
};

export const getCurrencySymbol = (currency = "USD") =>
  CURRENCY_SYMBOLS[currency] || "$";
