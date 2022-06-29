const path = require('path');

import { promisify } from 'util';
import { writeFile, existsSync, readFile, mkdir, appendFile } from 'fs';
import { randomUUID } from 'crypto';

import { LogProvider } from '@core/providers/LogProvider';
import { IFileOpOpts } from '@core/models/IFileOp';

export const asyncWriteFile = promisify(writeFile);
export const asyncReadFile = promisify(readFile);
export const asyncMkdir = promisify(mkdir);
export const asyncAppendFile = promisify(appendFile);

/*
  File Operation Helper Class
*/

export class FileOpProvider {
  private log = new LogProvider('File Op Provider');
  constructor(private opts?: IFileOpOpts) {}

  exists(pathForFile: string): boolean {
    try { return existsSync(pathForFile); } 
    catch (err) { throw err; }
  }

  async mkdir(path: string): Promise<boolean> {
    try { 
      await asyncMkdir(path);

      return true;
    } catch (err) { throw err; }
  }

  async readFile(fileName: string) {
    try {
      this.log.info(`Attempting to read file: ${fileName}`);
      const res = await asyncReadFile(fileName, {
        ...this.opts?.encoding,
        ...this.opts?.flag
      });
      const jsonResult = JSON.parse(res.toString());
      this.log.success(`File successfully read to json object, returning result.`);

      return jsonResult;
    } catch (err) { throw err; }  
  }

  async writeLogFile(payload: any, pathForFile?: string, passive?: boolean): Promise<string> {
    const filename = `${randomUUID({ disableEntropyCache: true })}.log`;
    const fullPath =  pathForFile ? pathForFile : path.normalize(path.join(process.cwd(), filename));
    try {
      if (! passive) this.log.info(`Attempting to write json payload to this path: ${fullPath}`);
      if (! this.exists(fullPath)) await asyncWriteFile(fullPath, `${payload}\n`, this.opts);
      else await asyncAppendFile(fullPath,`${payload}\n`, this.opts);
      if (! passive) this.log.success(`File written to ${fullPath}.`)

      return fullPath;
    } catch (err) { throw err; }
  }
}