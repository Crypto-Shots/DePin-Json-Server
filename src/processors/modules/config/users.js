import { IS_DEBUG } from '../../../config/config.js';


// # ADMINS

export const MASTER_USERS = [
  'crypto-shots',
  'cryptoshots.nft',
  'denny0105',
];
if (IS_DEBUG) MASTER_USERS.push(
  'cryptoshots.test',
);


// # DELEGATED ACCESS

// Used to fetch a list of authorized users for each master user
export const AUTHORIZED_USERS_PERMLINK = 'djs-delegated-access-users';

// TODO: fetch them here on boot using dhive

export const delegatedAccessUsers = [];
