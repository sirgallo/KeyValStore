import { freemem } from 'os';
import lodash from 'lodash';
const { isEqual, cloneDeepWith } = lodash;

import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';

export const toMs = {
  sec: (sec: number): number => sec * 1000,
  min: (min: number): number => min * 60000
}

export const sleep = async (timeout: number) => new Promise(res => setTimeout(res, timeout));

export const isAtMaxMem = (usedMem: number): boolean => usedMem >= freemem();

//  Javascript only does shallow merge on primitives, need to recursively merge to merge nested objects
//  but just use lodash merge, it is better
export const mergeDeep = (target: any, source: any, depth?: number) => {
  if (depth < 0 || ! depth) {
    Object.keys(source).forEach( key => {
      const targetVal = target[key];
      const sourceVal = source[key];

      targetVal instanceof Array && sourceVal instanceof Array
        ? target[key] =  targetVal.concat(sourceVal)
        : targetVal instanceof Object && sourceVal instanceof Object
        ? target[key] = mergeDeep(Object.assign({}, targetVal), sourceVal, depth ? depth-- : null)
        : target[key] = sourceVal;
    });
  }

  return target;
}

export const memo = (target: any, source: any): boolean => isEqual(target, source);

//  await the function call, no need for unnecessary awaits
export const wrapAsync = async (func: Function, ...params) => {
  return new Promise( (resolve, reject) => {
    try {
      return resolve(func(...params));
    } catch (err) {
      return reject(err);
    }
  });
}

export const setIntervalQueue = (queue: SimpleQueueProvider, timeout: number = 200) => setInterval(() => queue.emitEvent(), timeout);

export const extractErrorMessage = (err: Error): string => err.message;

const HTTP_HEADERS = {
  'Content-Type': 'application/json'
}

export const generatePostRequest = (opts: any) => {
  return {
    method: 'POST',
    header: HTTP_HEADERS,
    body: JSON.stringify(opts)
  }
}

const schemaPrimitives = [
  'string',
  'number',
  'bigint',
  'boolean',
  'undefined',
  'null',
  'symbol'
];

export const generateObjectSchema = (object: any) => {
  const customizer = (element) => {
    const elemType = typeof element;
    if (schemaPrimitives.includes(elemType)) return elemType;
  }

  return cloneDeepWith(object, customizer);
}