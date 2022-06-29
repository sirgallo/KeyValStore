import { BaseServer } from '@baseServer/core/BaseServer';
import { LogProvider } from '@core/providers/LogProvider';

import { KeyValStoreRoute } from '@keyValStore/routes/KeyValStoreRoute';
import { keyValStoreRouteMapping } from '@keyValStore/configs/KeyValStoreRouteMapping';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';

export class InitKeyValStoreService extends BaseServer {
  private keyValInitLog: LogProvider = new LogProvider(`${this.name} Init`);
  private keyValStoreProv: KeyValStoreProvider = new KeyValStoreProvider();

  async startServer() {
    try {
      const keyValRoute = new KeyValStoreRoute(keyValStoreRouteMapping.store.name, this.keyValStoreProv);
      this.setRoutes([ 
        keyValRoute 
      ]);

      this.run();
    } catch (err) {
      this.keyValInitLog.error(err);
      throw err;
    }
  }
}