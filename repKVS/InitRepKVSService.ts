import { InitKeyValStoreService } from '@keyValStore/InitKeyValStoreService';

import { LogProvider } from '@core/providers/LogProvider';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';

export class InitRepKVSService extends InitKeyValStoreService {
  private repKVSLog: LogProvider = new LogProvider(`Replicated ${this.name} Init`);

  async startServer() {
    try {
      this.startServer();
    } catch (err) {
      this.repKVSLog.error(err);
      throw err;
    }
  }
}