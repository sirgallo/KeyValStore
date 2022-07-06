import { BaseServer } from '@baseServer/core/BaseServer';
import { LogProvider } from '@core/providers/LogProvider';
import { EventDrivenLogProvider } from '@core/providers/queue/EventDrivenLogProvider';

import { KeyValStoreRoute } from '@keyValStore/routes/KeyValStoreRoute';
import { keyValStoreRouteMapping } from '@keyValStore/configs/KeyValStoreRouteMapping';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';
import { EventDrivenLogRoute } from './routes/EventDrivenLogRoute';
import { eventDrivenLogRouteMapping } from './configs/EventDrivenLogRouteMapping';
import { GossipProtocolProvider } from '@core/providers/replication/GossipProvider';
import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';

const KEY_VAL_EVENT = 'Key Val Event';

export class InitKeyValStoreService extends BaseServer {
  private keyValInitLog: LogProvider = new LogProvider(`${this.name} Init`);
  private keyValStoreProv: KeyValStoreProvider = new KeyValStoreProvider();

  constructor(
    name: string, 
    port?: number, 
    version?: string, 
    numOfCpus?: number
  ) { super(name, port, version, numOfCpus); }

  async startServer() {
    try {
      const keyValOperationQueue: SimpleQueueProvider = new SimpleQueueProvider(KEY_VAL_EVENT);
      const eventLog: EventDrivenLogProvider = new EventDrivenLogProvider();
      eventLog.start();

      const gossipProvider: GossipProtocolProvider = new GossipProtocolProvider(eventLog, this.keyValStoreProv, 0);
      gossipProvider.start();

      const keyValRoute = new KeyValStoreRoute(keyValStoreRouteMapping.store.name, this.keyValStoreProv, eventLog, keyValOperationQueue);
      const eventLogRoute = new EventDrivenLogRoute(eventDrivenLogRouteMapping.store.name, eventLog, gossipProvider);

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