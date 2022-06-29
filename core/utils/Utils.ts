import { freemem } from 'os';

export const toMs = {
  sec: (sec: number): number => sec * 1000,
  min: (min: number): number => min * 60000
}

export const sleep = async (timeout: number) => new Promise(res => setTimeout(res, timeout));

export const isAtMaxMem = (usedMem: number): boolean => usedMem >= freemem();

export const wrapAsync = async(func: Function, ...params) => {
  return new Promise( (resolve, reject) => {
    try {
      return resolve(func(...params));
    } catch (err) {
      return reject(err);
    }
  });
}