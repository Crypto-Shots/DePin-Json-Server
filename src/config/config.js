
// APP
export const APP_ID = 'djs-server';

// QUEUE
export const QUEUE_MAX_SIZE = 40;

// HIVE API
export const DEFAULT_HIVE_API_NODE = 'https://hiveapi.actifit.io';
export const CUSTOM_JSON_OPERATION_ID = 18;
export const LATEST_BLOCK_PATH_V2 = `hafbe-api/block-search?page-size=1`;
export const getBlockDataPath = (blockNumber) => `hafah-api/blocks/${blockNumber}/operations?operation-types=18&path-filter=value.id=${APP_ID}`;

// TIMES
export const PRODUCER_INTERVAL_MS = 3000;
export const CONSUMER_NORMAL_DELAY_MS = 2000;
export const CONSUMER_SHORTER_DELAY_MS = 1000;
export const INITIAL_BACKOFF_MS = 1000;

// ERROR HANDLING
export const PRODUCER_MAX_BACKOFF_ATTEMPTS = 50;
export const CONSUMER_MAX_BACKOFF_ATTEMPTS = 20;

// OTHER APIs
export const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN'; // Replace with actual webhook URL

// MISC
export const IS_DEBUG = true;
