import fetch from 'cross-fetch';
import {
  getBlockDataPath,
  INITIAL_BACKOFF_MS,
  CUSTOM_JSON_OPERATION_ID,
  DEFAULT_HIVE_API_NODE,
  IS_DEBUG,
  LATEST_BLOCK_PATH_V2,
} from '../config/config.js';
import { notifyDiscord } from './discord.js';

import { peakdBeaconWrapper } from 'hiverewards';
import { nap } from '../utils/utils.js';
const { getHealthyHiveNode } = peakdBeaconWrapper;


let node = DEFAULT_HIVE_API_NODE;

const getHealthyNode = async (attempt = 1, defaultRetryDelay = 300, maxRetries = 10) => {
  try {
    node = await getHealthyHiveNode();
    console.log('Picked new node:', { node, attempt });
    const res = await fetch(`${node}/${LATEST_BLOCK_PATH_V2}`);
    if (!res.ok) throw new Error(`Response not ok: ${res.status}`);
    return node;
  } catch (err) {
    console.error('Failed to get healthy Hive node with v1 path', { attempt }, err);
    if (attempt === maxRetries) return DEFAULT_HIVE_API_NODE;
    await nap((2 ** attempt) * defaultRetryDelay);
    return getHealthyNode(++attempt);
  }
};

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
      let url;
      try {
        url = `${node}/${LATEST_BLOCK_PATH_V2}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (!data?.blocks_result || !data?.blocks_result[0]?.block_num) {
          throw new Error('Invalid response, missing block data');
        }
        IS_DEBUG && console.log('Block data:', data.blocks_result[0]);
        const { block_num, operations = [] } = data.blocks_result[0];
        if (!operations.find(opObj => opObj.op_type_id === CUSTOM_JSON_OPERATION_ID)) {
          return null;
        }
        return block_num;
      } catch (err) {
        console.error('Something broke fetching latest block', url, err);
        node = await getHealthyNode();

        caughtfetchBlock++;
        if (caughtfetchBlock === maxAttempts) {
          await notifyDiscord(
            `${LATEST_BLOCK_PATH_V2} has exceeded ${maxAttempts} attempts. Error: ${err}`
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
      let path;
      try {
        path = getBlockDataPath(blockNumber);
        const url = `${node}/${path}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        console.error('Something broke fetching block data', err);
        node = await getHealthyNode();

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
