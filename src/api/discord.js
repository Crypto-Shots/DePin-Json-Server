import fetch from 'node-fetch';
import { DISCORD_WEBHOOK_URL } from '../config.js';

export async function notifyDiscord(message) {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}
