import path from 'path'

import { IFileOpOpts } from '@core/models/filesystem/IFileOp';
import {
  CustomMessageWrap,
  Message,
  BASE, ERROR, WARN, INFO, DEBUG, TIMER, STATUSOK
} from '@core/models/ILog';

import { FileOpProvider } from '@core/providers/filesystem/FileOpProvider';
import { randomUUID } from 'crypto';

/*
  Log Provider provides colored logs, as well as the ability to create custom logs
  
  Provide base name to constructor so that the log has a predefined location
*/

export class LogProvider {
  private log = console.log;
  private table = console.table;
  
  fileSystemLog: FileSystemLogProvider;
  
  constructor(private baseName: string) {}

  initFileLogger(logPath?: string) {
    this.fileSystemLog = new FileSystemLogProvider(this.baseName, logPath);
  }

  debug(message: Message) {
    this.log(BASE(this.formatBaseName()), DEBUG(message));
  }

  getFileSystem(): FileSystemLogProvider {
    return this.fileSystemLog;
  }

  info(message: Message) {
    this.log(BASE(this.formatBaseName()), INFO(message));
  }

  warn(message: Message) {
    this.log(BASE(this.formatBaseName()), WARN(message));
  }

  error(message: Message) {
    this.log(BASE(this.formatBaseName()), ERROR(message));
  }

  success(message: Message) {
    this.log(BASE(this.formatBaseName()), INFO(message), STATUSOK('[SUCCESS]'));
  }

  timer(elapsedTime: number) {
    this.log(
      BASE(this.formatBaseName()), 
      TIMER(`${new Date().toUTCString()} =>`),
      INFO(`Time Elapsed In Milliseconds: ${TIMER(elapsedTime)}`)
    );
  }

  newLine() {
    this.log();
  }
  
  boolean(bool: boolean) {
    bool ? this.log(BASE(this.formatBaseName()), STATUSOK(bool)) : this.log(BASE(this.formatBaseName()), ERROR(false));
  }

  custom(message: CustomMessageWrap, newLine?: boolean) {
    const finalMessage: string = Object.keys(message)
      .map(key => message[key].color(message[key].text))
      .join(' ');

    if (newLine) this.log();
    this.log(BASE(this.formatBaseName()), finalMessage);
  }

  logTable(data: any, fields?: string[]) {
    this.table(data, fields);
  }

  json(json: any) {
    const stringifiedJson = Object.keys(json).map(key => [ INFO(`{ ${key}: ${BASE(json[key])} }`), ])
      .join('');

    this.log(stringifiedJson);
  }

  private formatBaseName(): string {
    return `[${this.baseName.toUpperCase()}]: `;
  }
}

class FileSystemLogProvider extends LogProvider {
  private fileOp: FileOpProvider;
  private fileName: string = `${randomUUID({ disableEntropyCache: true })}.log`;
  constructor(baseName: string, private logPath?: string, private opts?: IFileOpOpts) {
    super(baseName);
    this.fileOp = new FileOpProvider(this.opts);
  }

  async writeLogToFile(consoleLog: any, provider: string) {
    try {
      await this.fileOp.writeLogFile(consoleLog, path.normalize(path.join(process.cwd(),`${provider.replace(' ', '')}.${this.fileName}`)), true);
    } catch (err) {
      this.error('Error writing to Log to File.');
      throw err;
    }
  }
}