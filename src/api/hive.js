import fetch from 'node-fetch';
import {
  LATEST_BLOCK_URL,
  getBlockDataUrl,
  INITIAL_BACKOFF_MS,
  CUSTOM_JSON_OPERATION_ID,
} from '../config/config.js';
import { notifyDiscord } from './discord.js';


async function retryWithExponentialBackoff(apiCallFunc, apiName, maxAttempts) {
  let attempt = 1;
  let delay = INITIAL_BACKOFF_MS;
  while (attempt <= maxAttempts) {
    try {
      const result = await apiCallFunc();
      return result;
    } catch (error) {
      console.error(`${apiName} attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) {
        await notifyDiscord(
          `${apiName} has exceeded ${maxAttempts} attempts. Error: ${error}`
        );
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
      attempt++;
    }
  }
}

let caughtfetchBlock = 0;

export async function getLatestBlock(maxAttempts) {
  return await retryWithExponentialBackoff(
    async () => {
      try {
        const res = await fetch(LATEST_BLOCK_URL);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (!data?.blocks_result || !data?.blocks_result[0]?.block_num) {
          throw new Error('Invalid response, missing block data');
        }
        const { block_num, op_type_ids = [] } = data.blocks_result[0];
        if (!op_type_ids.includes(CUSTOM_JSON_OPERATION_ID)) {
          return null;
        }
        return block_num;
      } catch (err) {
        console.error('Something broke fetching latest block', err);
        caughtfetchBlock++;
        if (caughtfetchBlock === maxAttempts) {
          await notifyDiscord(
            `${LATEST_BLOCK_URL} has exceeded ${maxAttempts} attempts. Error: ${err}`
          );
          caughtfetchBlock = 0;
        }
      }
    },
    'Fetch Latest Block API',
    maxAttempts
  );
}

let caughtBlockData = 0;

export async function getBlockData(blockNumber, maxAttempts) {
  return await retryWithExponentialBackoff(
    async () => {
      let url;
      try {
        url = getBlockDataUrl(blockNumber);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        console.error('Something broke fetching block data', err);
        caughtBlockData++;
        if (caughtBlockData === maxAttempts) {
          await notifyDiscord(
            `${url} has exceeded ${maxAttempts} attempts. Error: ${err}`
          );
          caughtBlockData = 0;
        }
      }
    },
    `Fetch Block Data API for block ${blockNumber}`,
    maxAttempts
  );
}
