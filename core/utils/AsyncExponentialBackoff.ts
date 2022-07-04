import got from 'got';

import { sleep, extractErrorMessage } from '@core/utils/Utils';
import { LogProvider } from '@core/providers/LogProvider';

const log = new LogProvider('Async Exponential Backoff');

export async function asyncExponentialBackoff(
  endpoint: string,
  retries: number, 
  timeout: number,
  request: any,
  depth = 1): Promise<any> {
  try {
    if (depth > retries) throw new Error(`Exceeded Max Retries: ${retries}`);
    
    return await got
      .post(endpoint, request)
      .json() as any;
  } catch (err) {
    if (depth > retries) throw err;
    else {
      log.error(`Error Stack ${extractErrorMessage(err)}\n`)
      
      const newTimeout = 2 * depth * timeout;

      log.info(`Moving to attempt: ${depth}`);
      log.info(`Waiting for: ${newTimeout}ms\n`);

      await sleep(newTimeout);

      return await asyncExponentialBackoff(endpoint, retries, timeout, request, depth + 1);
    }
  }
}