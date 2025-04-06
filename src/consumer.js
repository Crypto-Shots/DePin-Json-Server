import { setLastProcessedBlock } from './queue.js';
import { getBlockData } from './api/hive.js';
import { processPayload } from './processors/scheduler.js';
import { nap } from './utils/utils.js';
import { CONSUMER_NORMAL_DELAY_MS, CONSUMER_SHORTER_DELAY_MS, CONSUMER_MAX_BACKOFF_ATTEMPTS, IS_DEBUG, APP_ID } from './config.js';


const consumer = async (blockQueue) => {
  while (true) {
    if (!blockQueue.isEmpty()) {
        // Extract oldest block number from the queue
      const blockNumber = blockQueue.dequeue();
      try {
        // Fetch data for given block
        const data = await getBlockData(blockNumber, CONSUMER_MAX_BACKOFF_ATTEMPTS);
        IS_DEBUG && console.log(`[consumer] data for block ${blockNumber}:`, JSON.stringify(data));
        setLastProcessedBlock(blockNumber);
        // Extract Json body
        const { total_operations = 0, operations_result = [] } = (data || {});
        if (total_operations > 0) { // ignoring other custom json operations
          const { id: operationId, json: jsonStr } = (operations_result[0]?.op?.value || {});
          if (operationId === APP_ID) {
            let json;
            try {
              json = JSON.parse(jsonStr);
            } catch (err) {
              throw new Error(`Invalid json body: ${jsonStr}`);
            }
            // Process payload
            processPayload(json);
          }
        }
      } catch (error) {
        console.error(`[consumer] Failed to process block ${blockNumber} (for fetch after ${CONSUMER_MAX_BACKOFF_ATTEMPTS
          } retries). DROPPING IT.`, error);
      }
      IS_DEBUG && console.log('[consumer] waiting for new customJson blockNumber in the queue');
      await nap(CONSUMER_NORMAL_DELAY_MS)
    } else {
      await nap(CONSUMER_SHORTER_DELAY_MS)
    }
  }
};

export default consumer;
