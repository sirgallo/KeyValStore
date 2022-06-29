import { sleep } from '@core/utils/Utils';
import { LogProvider } from '@core/providers/LogProvider';

const log = new LogProvider('Async Exponential Backoff');

export async function asyncExponentialBackoff(
  endpoint: string,
  retries: number, 
  timeout: number, 
  reqFunction: Function, 
  request: any,
  depth = 1): Promise<any> {
  try {
    if (depth > retries) throw new Error(`Exceeded Max Retries: ${retries}`);
    else return await reqFunction(endpoint, request);
  } catch (err) {
    if (depth > retries) throw err;
    else {
      const newTimeout = 2 * depth * timeout;

      log.info(`Moving to attempt: ${depth}`);
      log.info(`Waiting for: ${newTimeout}ms`);

      await sleep(newTimeout);
      return await asyncExponentialBackoff(endpoint, retries, timeout, reqFunction, request, depth + 1);
    }
  }
}