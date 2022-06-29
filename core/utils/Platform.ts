export enum PlatformOptions {
  Windows = 'win32',
  MacOS = 'darwin',
  Linux = 'linux'
}

export type PlatformOptionsType = 'windows' | 'unix';

export const getPlatform = process.platform;