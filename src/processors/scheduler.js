import { IS_DEBUG } from '../config/config.js';
import { execAdminCommand } from './modules/exec.js';


/**
 * Common interface for all processors.
 * Each processor must implement a process(payload) method.
 */
const processors = [
  {
    name: 'commandExecutor',
    async process({ payload, author }) {
      await execAdminCommand({ payload, author });
    },
  },
  // The processor above can be replaced with another or more processors can be added here:
  // {
  //   name: 'gameDataProcessor',
  //   async process({ payload, author }) { ... }
  // },
];


/**
 * Dispatches the given payload to all registered processors sequentially.
 *
 * @param {object} payload - The JSON payload to process.
 */
export async function processPayload({ json: payload, author }) {
  for (let id = 0; id < processors.length; id++) {
    const currentProcessor = processors[id];
    try {
      IS_DEBUG && console.log(`[payloadProcessors] Dispatching payload to processor: ${currentProcessor.name}`);
      await currentProcessor.process({ payload, author });
    } catch (error) {
      console.error(`Error in processor "${currentProcessor.name}":`, error);
    }
  }
}
