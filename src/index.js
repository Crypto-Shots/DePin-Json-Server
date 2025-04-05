import { BlockQueue } from './queue.js';
import publisher from './publisher.js';
import consumer from './consumer.js';

const blockQueue = new BlockQueue();

(() => {
  publisher(blockQueue);
  consumer(blockQueue);
})();
