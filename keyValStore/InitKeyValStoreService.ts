import { BaseServer } from '@baseServer/core/BaseServer';
import { LogProvider } from '@core/providers/LogProvider';
import { EventDrivenLogProvider } from '@core/providers/queue/EventDrivenLogProvider';

import { KeyValStoreRoute } from '@keyValStore/routes/KeyValStoreRoute';
import { keyValStoreRouteMapping } from '@keyValStore/configs/KeyValStoreRouteMapping';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';
import { EventDrivenLogRoute } from './routes/EventDrivenLogRoute';
import { eventDrivenLogRouteMapping } from './configs/EventDrivenLogRouteMapping';

export class InitKeyValStoreService extends BaseServer {
  private keyValInitLog: LogProvider = new LogProvider(`${this.name} Init`);

  constructor(
    name: string, 
    port?: number, 
    version?: string, 
    numOfCpus?: number, 
    private keyValStoreProv: KeyValStoreProvider = new KeyValStoreProvider()
  ) { super(name, port, version, numOfCpus); }

  async startServer() {
    try {
      const eventLog: EventDrivenLogProvider = new EventDrivenLogProvider();
      eventLog.start();

      const keyValRoute = new KeyValStoreRoute(keyValStoreRouteMapping.store.name, this.keyValStoreProv, eventLog);
      const eventLogRoute = new EventDrivenLogRoute(eventDrivenLogRouteMapping.store.name, eventLog);

      this.setRoutes([ 
        keyValRoute,
        eventLogRoute
      ]);

      this.run();
    } catch (err) {
      this.keyValInitLog.error(err);
      throw err;
    }
  }
}