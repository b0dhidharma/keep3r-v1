import axios from 'axios';
import axiosRetry from 'axios-retry';
import { BigNumber, utils } from 'ethers';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

type CoingeckoDataPoints = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

export const getCoingeckoDataPoints = async (coin: string, currency: string, from: number, to: number): Promise<CoingeckoDataPoints> => {
  const coingeckoDatapoints = (
    await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range?vs_currency=${currency}&from=${from}&to=${to}`)
  ).data as CoingeckoDataPoints;
  return coingeckoDatapoints;
};

type CoingeckoSimple = { [coin: string]: { [currency: string]: number } };

export const getSimple = async (coin: string, currency: string): Promise<number> => {
  const coingeckoSimple = (await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${currency}`))
    .data as CoingeckoSimple;
  return coingeckoSimple[coin][currency];
};

export const getLastPrice = async (coin: string, currency: string, from: number, to: number): Promise<number> => {
  const coingeckoDataPoints = await getCoingeckoDataPoints(coin, currency, from, to);
  return coingeckoDataPoints.prices[0][1];
};

export const convertPriceToBigNumberWithDecimals = (price: number, decimals: number): BigNumber => {
  return utils.parseUnits(`${price.toFixed(decimals)}`, decimals);
};

export const convertPriceToNumberWithDecimals = (price: number, decimals: number): number => {
  return convertPriceToBigNumberWithDecimals(price, decimals).toNumber();
};
