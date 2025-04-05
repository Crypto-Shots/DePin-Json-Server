import { getLastProcessedBlock, setLastProcessedBlock } from './queue.js';
import { getLatestBlock } from './api/hive.js';
import { IS_DEBUG, PRODUCER_INTERVAL_MS, PRODUCER_MAX_BACKOFF_ATTEMPTS } from './config.js';
import { nap } from './utils/utils.js';

const publisher = async (blockQueue) => {
  while (true) {
    try {
      const highestCustomJsonBlock = await getLatestBlock(PRODUCER_MAX_BACKOFF_ATTEMPTS);
      IS_DEBUG && console.log(`Fetched highest block. Has custom json? ${highestCustomJsonBlock}`);
      const lastProcessed = getLastProcessedBlock() // updated by consumer
        || (highestCustomJsonBlock - 1); // if just booted, start from highest block
      // NOTE: it's null if it contained no custom_json operations and we ignore it
      if (highestCustomJsonBlock) {
        for (let bl = lastProcessed + 1; bl <= highestCustomJsonBlock; bl++) {
          IS_DEBUG && console.log(`[publisher] Adding block ${bl} to the queue..`,
            { lastProcessed, highestCustomJsonBlock, queue: blockQueue.toString() });
          if (!blockQueue.enqueue(bl)) {
            break;
          }
        }
      } else {
        setLastProcessedBlock(lastProcessed + 1);
      }
    } catch (error) {
      console.error(`[publisher] Caught error fetching latest block (for fetch after ${PRODUCER_MAX_BACKOFF_ATTEMPTS
        } attempts). Trying again in a bit.`, error);
      await nap(PRODUCER_INTERVAL_MS * 10);
    }
    IS_DEBUG && console.log('[publisher] Waiting for the next block..');
    await nap(PRODUCER_INTERVAL_MS);
  }
};

export default publisher;
