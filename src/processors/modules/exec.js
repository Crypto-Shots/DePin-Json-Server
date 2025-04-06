import { IS_DEBUG } from '../../config.js';

import { spawn } from 'child_process';

/**
 * Executes a shell command in detached mode.
 * The command runs in the background and the function resolves immediately with the child process's PID.
 *
 * @param {string} command - The command to execute.
 * @param {string[]} args - The command arguments.
 * @returns {Promise<{ pid: number }>} - Resolves with the PID of the detached process.
 */
function runCommandDetached(command, args = []) {
  return new Promise((resolve, reject) => {
    IS_DEBUG && console.log(`[runCommandDetached] Calling detached spawn on command: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      detached: true,
      stdio: [
        'ignore', // no interactive input from DJS server
        'pipe', // stdout
        'pipe', // stderr
      ],
    });
    const pid = child.pid;

    child.stdout.on('data', (data) => {
      console.log(`<${pid}> [stdout] ${data.toString()}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`<${pid}> [stderr] ${data.toString()}`);
    });

    child.on('error', (error) => {
      console.error(`<${pid}> Error executing command "${command}":`, error);
      reject(error);
    });

    child.on('close', (code) => {
      console.log(`<${pid}> Detached command "${command}" exited with code ${code}`);
    });

    // Unref the child so it can run independently
    child.unref();

    resolve({ pid });
  });
}

/**
 * Processes the payload by extracting the "cmd" property and executing it in detached mode.
 * This function is designed to be part of a generic integration interface.
 *
 * @param {object} json - The payload that must include a "cmd" property.
 * @returns {Promise<{ pid: number }>} - The result of the command execution.
 */
export async function execAdminCommand(json) {
  if (!json || typeof json !== 'object' || !json.cmd) {
    throw new Error('Invalid payload: Expected an object with a "cmd" property.');
  }
  console.log('[execAdminCommand] executing command found in payload:', json.cmd);
  // Split the command string into the command and its arguments.
  // For more complex parsing, use a library like shell-quote.
  const parts = json.cmd.split(' ');
  const command = parts[0];
  const args = parts.slice(1);
  const pid = await runCommandDetached(command, args);
  console.log('[execAdminCommand] background process started with ID', pid);
}
