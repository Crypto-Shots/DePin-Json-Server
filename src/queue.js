import { IS_DEBUG, QUEUE_MAX_SIZE } from './config.js';


let lastProcessedBlock = 0;

export const getLastProcessedBlock = () => lastProcessedBlock;

export const setLastProcessedBlock = (val) => {
  lastProcessedBlock = val;
  addToLastProcessedBlocks(val);
};

const lastProcessedBlocks = [];

const addToLastProcessedBlocks = (blockNumber) => {
  lastProcessedBlocks.push(blockNumber);
  if (lastProcessedBlocks.length > 10) {
    lastProcessedBlocks.shift();
  }
};


export class BlockQueue {
  constructor() {
    this.queue = [];
    this.maxSize = QUEUE_MAX_SIZE;
  }

  enqueue = (blockNumber) => {
    const dupeQueue = this.queue.includes(blockNumber);
    const dupeCache = lastProcessedBlocks.includes(blockNumber);
    if (dupeQueue || dupeCache) {
      IS_DEBUG && console.warn(`Tried to add block that was already in ${dupeQueue ? 'queue' : 'cache'}: ${blockNumber}`);
      return true; // continue
    }
    if (this.queue.length >= this.maxSize) {
      console.error(`Queue is full. Last processed block: ${blockNumber}`);
      return false; // stop
    }
    this.queue.push(blockNumber);
    return true;
  };

  dequeue = () => this.queue.shift();

  isEmpty = () => this.queue.length === 0;

  toString = () => this.queue.join(', ');
}
